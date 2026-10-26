#!/usr/bin/env python3
"""Outsistent CRM backend for karina.kovcheg.ai (Kovcheg nine-layer agent system, see SYSTEM.md).

Flow: the form (POST /api/lead) stores a lead and opens an interview chat on the site;
the interviewer agent asks 4–6 short questions (/api/chat); when the chat ends, or after
30 quiet minutes, the reporter agent writes a brief for Karina. Karina works the leads in
the password-protected panel /crm/ (/api/crm/*). Both agents run through the Claude CLI on
this box, without tools, with a JSON schema for the answer.

Runs as the systemd --user unit karina-leads.service, bound to the Tailscale address only;
the DO droplet's nginx proxies https://karina.kovcheg.ai/api/ here. Stdlib only.
"""
import argparse
import hashlib
import hmac
import json
import os
import queue
import re
import secrets
import sqlite3
import subprocess
import threading
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
AGENTS = HERE / "agents"
HOME = Path.home()
CLAUDE_BIN = os.environ.get("CLAUDE_BIN", str(HOME / ".local/bin/claude"))
AGENT_CWD = HOME / ".local/share/karina-crm-agent"  # neutral folder: no project CLAUDE.md above it
INTERVIEW_MODEL = os.environ.get("KARINA_INTERVIEW_MODEL", "sonnet")
REPORT_MODEL = os.environ.get("KARINA_REPORT_MODEL", "opus")
SITE = "https://karina.kovcheg.ai"
BOT_ENV = HOME / ".claude/channels/telegram/.env"
BOT_ACCESS = HOME / ".claude/channels/telegram/access.json"

MAX_BODY = 32 * 1024
RATE = (5, 600)            # leads per IP per 10 minutes
CHAT_RATE = (40, 600)      # chat messages per IP per 10 minutes
MAX_CLIENT_MSGS = 12
QUIET_MINUTES = 30
FIELDS = {
    "name": 120, "phone": 40, "email": 160, "telegram": 80, "interest": 80, "business": 40,
    "fop_count": 4, "tov_count": 4, "activity": 400, "turnover": 40, "bookkeeping": 60,
    "bank_requests": 30, "reason": 3000,
}
REQUIRED = ("name", "phone", "email", "activity", "reason")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[0-9 +()\-]{9,20}$")
STATUSES = ("new", "interview", "report", "contacted", "client", "lost")

# Ads dashboard (/crm/stats): campaigns to report, read-only Graph API calls with the system-user token.
META_ENV = HOME / ".claude/secrets/meta-ads.env"
META_GRAPH = "https://graph.facebook.com/v24.0"
CAMPAIGNS = [c for c in os.environ.get("KARINA_CAMPAIGNS", "52526722135329").split(",") if c]
HIT_RATE = (120, 600)
HITS_SCHEMA = """
CREATE TABLE IF NOT EXISTS hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL, day TEXT NOT NULL, path TEXT, source TEXT, campaign TEXT, content TEXT,
  ref TEXT, visitor TEXT, mobile INTEGER
);
CREATE INDEX IF NOT EXISTS hits_day ON hits(day);
"""
_meta_cache: dict = {"at": 0.0, "data": None}

SCHEMA = """
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  name TEXT, phone TEXT, email TEXT, telegram TEXT,
  interest TEXT, business TEXT, fop_count TEXT, tov_count TEXT, activity TEXT,
  turnover TEXT, bookkeeping TEXT, bank_requests TEXT, reason TEXT,
  meta TEXT, ip TEXT, user_agent TEXT
);
"""
EXTRA_COLUMNS = {
    "token": "TEXT", "chat": "TEXT", "interview": "TEXT DEFAULT 'none'", "last_activity": "TEXT",
    "report_md": "TEXT", "report_summary": "TEXT", "priority": "TEXT", "recommended": "TEXT",
    "report_at": "TEXT", "report_error": "TEXT", "report_attempts": "INTEGER DEFAULT 0", "notes": "TEXT", "updated_at": "TEXT",
}

# Used when Claude is unavailable (limits, outage): the same interview, asked from a fixed list.
SCRIPTED = [
    "Вітаю! Я AI-асистентка Карини Замкової. Дякую за анкету. Поставлю кілька коротких питань, щоб Карина підготувалась до розмови з вами. Відповідайте як зручно або завершіть будь-коли.\n\nСкільки ФОП або ТОВ працює у вашому бізнесі і хто в них записаний: ви, родичі, партнер?",
    "Дякую. Звідки приходять гроші від покупців: маркетплейси, накладений платіж, еквайринг, особисті картки?",
    "Чи були запити від банку чи податкової, блокування або листи? Якщо так — коли і чим закінчилось.",
    "Хто зараз веде облік і що вас у ньому турбує?",
    "Наскільки це терміново і як вам зручніше зв'язатися: дзвінок чи Telegram, у який час?",
]
SCRIPTED_END = "Дякую, цього достатньо. Карина перегляне ваші відповіді й зв'яжеться з вами протягом робочого дня."

INTERVIEW_SCHEMA = {
    "type": "object",
    "properties": {"reply": {"type": "string"}, "done": {"type": "boolean"}},
    "required": ["reply", "done"],
    "additionalProperties": False,
}
REPORT_SCHEMA = {
    "type": "object",
    "properties": {
        "priority": {"type": "string", "enum": ["hot", "warm", "cold"]},
        "recommended": {"type": "string"},
        "summary": {"type": "string"},
        "report_md": {"type": "string"},
    },
    "required": ["priority", "recommended", "summary", "report_md"],
    "additionalProperties": False,
}
PUBLIC_LEAD_FIELDS = ("name", "interest", "business", "fop_count", "tov_count", "activity", "turnover", "bookkeeping", "bank_requests", "reason")

DB_PATH: Path = HERE / "leads.db"
PASSWORD = ""
_claude_slots = threading.Semaphore(2)
_claude_down_until = 0.0  # after a limit/outage, skip Claude for a while instead of making clients wait
_reports: "queue.Queue[int]" = queue.Queue()
_queued: set[int] = set()
_hits: dict[str, list[float]] = {}
_lock = threading.Lock()


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def db() -> sqlite3.Connection:
    con = sqlite3.connect(DB_PATH, timeout=10)
    con.row_factory = sqlite3.Row
    return con


def migrate():
    with db() as con:
        con.executescript(SCHEMA)
        have = {r["name"] for r in con.execute("PRAGMA table_info(leads)")}
        for col, typ in EXTRA_COLUMNS.items():
            if col not in have:
                con.execute(f"ALTER TABLE leads ADD COLUMN {col} {typ}")
        con.execute("CREATE UNIQUE INDEX IF NOT EXISTS leads_token ON leads(token)")
        con.executescript(HITS_SCHEMA)
    DB_PATH.chmod(0o600)


def limited(key: str, rate: tuple[int, int]) -> bool:
    t = time.time()
    with _lock:
        hits = [h for h in _hits.get(key, []) if t - h < rate[1]]
        over = len(hits) >= rate[0]
        if not over:
            hits.append(t)
        _hits[key] = hits
        return over


def notify(text: str):
    """Note to Konstantin through his Claude Telegram bot (same channel as claude-rc-watch)."""
    try:
        token = next(l.split("=", 1)[1].strip() for l in open(BOT_ENV) if l.startswith("TELEGRAM_BOT_TOKEN="))
        chat = json.load(open(BOT_ACCESS))["allowFrom"][0]
        data = urllib.parse.urlencode({"chat_id": chat, "text": text, "disable_web_page_preview": "true"}).encode()
        urllib.request.urlopen("https://api.telegram.org/bot%s/sendMessage" % token, data, timeout=20).read()
    except Exception as e:  # a missed notice must not break the CRM
        print(f"telegram notice failed: {e.__class__.__name__}", flush=True)


# ------------------------------------------------------------------ agents

def call_claude(system_prompt: str, user_prompt: str, schema: dict, model: str, timeout: int) -> dict:
    global _claude_down_until
    if time.time() < _claude_down_until:
        raise RuntimeError("claude paused after a recent failure")
    try:
        return _call_claude(system_prompt, user_prompt, schema, model, timeout)
    except Exception:
        _claude_down_until = time.time() + 15 * 60
        raise


def _call_claude(system_prompt: str, user_prompt: str, schema: dict, model: str, timeout: int) -> dict:
    with _claude_slots:
        AGENT_CWD.mkdir(parents=True, exist_ok=True)
        args = [CLAUDE_BIN, "-p", "--model", model, "--output-format", "json",
                "--json-schema", json.dumps(schema), "--system-prompt", system_prompt,
                "--tools", "", "--disable-slash-commands", "--exclude-dynamic-system-prompt-sections",
                user_prompt]
        out = subprocess.run(args, cwd=AGENT_CWD, capture_output=True, text=True, timeout=timeout,
                             env={**os.environ, "HOME": str(HOME)})
    if out.returncode != 0:
        raise RuntimeError(f"claude exit {out.returncode}: {(out.stderr or out.stdout)[:300]}")
    parsed = json.loads(out.stdout)
    if parsed.get("is_error") or not isinstance(parsed.get("structured_output"), dict):
        raise RuntimeError(f"claude error: {str(parsed.get('result'))[:120]}")
    return parsed["structured_output"]


def agent_prompt(name: str) -> str:
    return (AGENTS / f"{name}.md").read_text() + "\n\n# База знань\n\n" + (AGENTS / "knowledge.md").read_text()


def anketa(row: sqlite3.Row) -> str:
    return "\n".join(f"- {k}: {row[k]}" for k in PUBLIC_LEAD_FIELDS if row[k])


def transcript(chat: list[dict]) -> str:
    who = {"assistant": "Асистентка", "client": "Клієнт"}
    return "\n".join(f"{who.get(m['role'], m['role'])}: {m['text']}" for m in chat) or "(інтерв'ю ще не було)"


def interviewer_turn(row: sqlite3.Row, chat: list[dict]) -> dict:
    try:
        return interviewer_llm(row, chat)
    except Exception as e:
        print(f"interviewer fallback: {str(e)[:120]}", flush=True)
        asked = sum(1 for m in chat if m["role"] == "assistant")
        if asked < len(SCRIPTED):
            return {"reply": SCRIPTED[asked], "done": False}
        return {"reply": SCRIPTED_END, "done": True}


def interviewer_llm(row: sqlite3.Row, chat: list[dict]) -> dict:
    asked = sum(1 for m in chat if m["role"] == "assistant")
    prompt = (f"Анкета клієнта:\n{anketa(row)}\n\nРозмова досі:\n{transcript(chat)}\n\n"
              f"Ти вже поставила питань: {asked}. "
              + ("Почни розмову." if not chat else "Дай наступну репліку."))
    return call_claude(agent_prompt("interviewer"), prompt, INTERVIEW_SCHEMA, INTERVIEW_MODEL, 120)


def make_report(lead_id: int):
    with db() as con:
        row = con.execute("SELECT * FROM leads WHERE id=?", (lead_id,)).fetchone()
    if not row:
        return
    chat = json.loads(row["chat"] or "[]")
    prompt = f"Анкета:\n{anketa(row)}\n\nКонтакти: {row['phone']}, {row['email']}, Telegram {row['telegram'] or '—'}\n\nІнтерв'ю:\n{transcript(chat)}"
    try:
        r = call_claude(agent_prompt("reporter"), prompt, REPORT_SCHEMA, REPORT_MODEL, 300)
    except Exception as e:
        with db() as con:
            con.execute("UPDATE leads SET report_error=?, report_attempts=COALESCE(report_attempts,0)+1, updated_at=? WHERE id=?",
                        (str(e)[:300], now(), lead_id))
        return
    with db() as con:
        con.execute(
            "UPDATE leads SET report_md=?, report_summary=?, priority=?, recommended=?, report_at=?, report_error=NULL, "
            "status=CASE WHEN status IN ('new','interview') THEN 'report' ELSE status END, updated_at=? WHERE id=?",
            (r["report_md"], r["summary"], r["priority"], r["recommended"], now(), now(), lead_id))
    icon = {"hot": "🔥", "warm": "🟡", "cold": "⚪"}.get(r["priority"], "")
    notify(f"Outsistent · бриф готовий {icon}\n{row['name']}: {r['summary'][:300]}\nПропонувати: {r['recommended'][:120]}\n{SITE}/crm/#lead-{lead_id}")


def queue_report(lead_id: int):
    with _lock:
        if lead_id in _queued:
            return
        _queued.add(lead_id)
    _reports.put(lead_id)


def report_worker():
    while True:
        lead_id = _reports.get()
        try:
            make_report(lead_id)
        finally:
            with _lock:
                _queued.discard(lead_id)


def sweeper():
    """Interviews that went quiet, and leads that never opened the chat, still get a brief."""
    while True:
        time.sleep(300)
        cutoff = (datetime.now(timezone.utc) - timedelta(minutes=QUIET_MINUTES)).isoformat(timespec="seconds")
        try:
            with db() as con:
                ids = [r["id"] for r in con.execute(
                    "SELECT id FROM leads WHERE report_md IS NULL AND COALESCE(report_attempts,0) < 120 "
                    "AND COALESCE(updated_at, last_activity, created_at) < ? AND status IN ('new','interview')", (cutoff,))]
            for i in ids:
                with db() as con:
                    con.execute("UPDATE leads SET interview=CASE WHEN interview='active' THEN 'quiet' ELSE interview END WHERE id=?", (i,))
                queue_report(i)
        except Exception as e:
            print(f"sweeper: {e.__class__.__name__}", flush=True)


# ------------------------------------------------------------------ lead intake

def clean(data: dict):
    if data.get("website"):  # honeypot
        return None, "spam"
    if data.get("consent") is not True:
        return None, "consent"
    out = {}
    for k, cap in FIELDS.items():
        v = data.get(k, "")
        out[k] = ("" if v is None else str(v)).strip()[:cap]
    for k in REQUIRED:
        if not out[k]:
            return None, f"missing {k}"
    if not EMAIL_RE.match(out["email"]):
        return None, "email"
    if not PHONE_RE.match(out["phone"]):
        return None, "phone"
    meta = data.get("meta") if isinstance(data.get("meta"), dict) else {}
    out["meta"] = json.dumps({str(k)[:40]: str(v)[:500] for k, v in list(meta.items())[:20]}, ensure_ascii=False)
    return out, ""


def lead_view(row: sqlite3.Row, full: bool) -> dict:
    keys = row.keys()
    d = {k: row[k] for k in keys if k not in ("token", "ip", "user_agent")}
    d["chat"] = json.loads(row["chat"] or "[]")
    d["meta"] = json.loads(row["meta"] or "{}")
    if not full:
        for k in ("chat", "report_md", "reason", "notes", "meta"):
            d.pop(k, None)
    return d


# ------------------------------------------------------------------ ads dashboard

def meta_token() -> str:
    for line in open(META_ENV):
        if line.startswith("META_ADS_TOKEN="):
            return line.split("=", 1)[1].strip().strip("\"'")
    raise RuntimeError("no META_ADS_TOKEN")


def graph(path: str, params: dict) -> dict:
    q = urllib.parse.urlencode({**params, "access_token": meta_token()})
    with urllib.request.urlopen(f"{META_GRAPH}/{path}?{q}", timeout=20) as r:
        return json.loads(r.read())


def action(actions, *names) -> float:
    total = 0.0
    for a in actions or []:
        if a.get("action_type") in names:
            total += float(a.get("value") or 0)
    return total


APPLY = ("offsite_conversion.fb_pixel_submit_application", "submit_application", "onsite_web_submit_application")
LPV = ("landing_page_view",)


def meta_stats() -> dict:
    """Spend, delivery and results per ad, plus spend by day. Cached for 10 minutes."""
    if _meta_cache["data"] and time.time() - _meta_cache["at"] < 600:
        return _meta_cache["data"]
    out = {"campaigns": [], "ads": [], "daily": [], "error": None, "fetched_at": now()}
    fields = "spend,impressions,reach,frequency,cpm,inline_link_clicks,inline_link_click_ctr,cost_per_inline_link_click,actions"
    try:
        for cid in CAMPAIGNS:
            c = graph(cid, {"fields": "name,status,effective_status,start_time,stop_time"})
            ins = graph(f"{cid}/insights", {"fields": fields, "date_preset": "maximum"}).get("data", [])
            ads = graph(f"{cid}/ads", {"fields": "name,effective_status,ad_review_feedback", "limit": 50}).get("data", [])
            ad_ins = {d["ad_id"]: d for d in graph(f"{cid}/insights", {"level": "ad", "fields": "ad_id," + fields, "date_preset": "maximum", "limit": 50}).get("data", [])}
            daily = graph(f"{cid}/insights", {"fields": "spend,impressions,inline_link_clicks,actions", "date_preset": "maximum", "time_increment": 1, "limit": 60}).get("data", [])
            budget = 0.0
            for s_ in graph(f"{cid}/adsets", {"fields": "lifetime_budget,daily_budget,end_time", "limit": 20}).get("data", []):
                budget += float(s_.get("lifetime_budget") or 0) / 100
            t = ins[0] if ins else {}
            out["campaigns"].append({
                "id": cid, "name": c.get("name"), "status": c.get("effective_status"), "budget": budget,
                "spend": float(t.get("spend") or 0), "impressions": int(t.get("impressions") or 0), "reach": int(t.get("reach") or 0),
                "frequency": float(t.get("frequency") or 0), "cpm": float(t.get("cpm") or 0),
                "clicks": int(t.get("inline_link_clicks") or 0), "ctr": float(t.get("inline_link_click_ctr") or 0),
                "cpc": float(t.get("cost_per_inline_link_click") or 0),
                "lpv": action(t.get("actions"), *LPV), "applications": action(t.get("actions"), *APPLY),
            })
            for a in ads:
                i = ad_ins.get(a["id"], {})
                out["ads"].append({
                    "id": a["id"], "name": a.get("name"), "status": a.get("effective_status"),
                    "review": a.get("ad_review_feedback") or None,
                    "spend": float(i.get("spend") or 0), "impressions": int(i.get("impressions") or 0),
                    "clicks": int(i.get("inline_link_clicks") or 0), "ctr": float(i.get("inline_link_click_ctr") or 0),
                    "cpc": float(i.get("cost_per_inline_link_click") or 0), "cpm": float(i.get("cpm") or 0),
                    "lpv": action(i.get("actions"), *LPV), "applications": action(i.get("actions"), *APPLY),
                })
            for d in daily:
                out["daily"].append({"day": d.get("date_start"), "spend": float(d.get("spend") or 0),
                                     "impressions": int(d.get("impressions") or 0), "clicks": int(d.get("inline_link_clicks") or 0)})
    except Exception as e:
        out["error"] = f"{e.__class__.__name__}: {str(e)[:160]}"
    _meta_cache.update(at=time.time(), data=out)
    return out


def site_stats() -> dict:
    with db() as con:
        q = lambda sql, *a: [dict(r) for r in con.execute(sql, a)]
        total = q("SELECT COUNT(*) n, COUNT(DISTINCT visitor||day) u FROM hits")[0]
        today = datetime.now(timezone.utc).date().isoformat()
        tod = q("SELECT COUNT(*) n, COUNT(DISTINCT visitor) u FROM hits WHERE day=?", today)[0]
        ads = q("SELECT COUNT(*) n, COUNT(DISTINCT visitor||day) u FROM hits WHERE source='meta'")[0]
        return {
            "visits": total["n"], "visitors": total["u"], "today_visits": tod["n"], "today_visitors": tod["u"],
            "ad_visits": ads["n"], "ad_visitors": ads["u"],
            "by_page": q("SELECT path, COUNT(*) n, COUNT(DISTINCT visitor) u FROM hits GROUP BY path ORDER BY n DESC LIMIT 12"),
            "by_source": q("SELECT COALESCE(NULLIF(source,''), CASE WHEN ref<>'' THEN ref ELSE 'прямі' END) src, COUNT(*) n, COUNT(DISTINCT visitor) u FROM hits GROUP BY src ORDER BY n DESC LIMIT 10"),
            "by_ad": q("SELECT content, COUNT(*) n, COUNT(DISTINCT visitor) u FROM hits WHERE source='meta' GROUP BY content ORDER BY n DESC"),
            "by_day": q("SELECT day, COUNT(*) n, COUNT(DISTINCT visitor) u, SUM(source='meta') ads FROM hits GROUP BY day ORDER BY day DESC LIMIT 14"),
            "mobile_share": (q("SELECT AVG(mobile) m FROM hits")[0]["m"] or 0),
            "recent": q("SELECT ts, path, source, content, ref, mobile FROM hits ORDER BY id DESC LIMIT 25"),
        }


def lead_stats() -> dict:
    with db() as con:
        rows = [dict(r) for r in con.execute("SELECT status, priority, meta, interview, report_md IS NOT NULL has_report FROM leads")]
    from_ads = [r for r in rows if '"utm_source": "meta"' in (r["meta"] or "")]
    count = lambda rs, k: {v: sum(1 for r in rs if r[k] == v) for v in {r[k] for r in rs}}
    return {"total": len(rows), "from_ads": len(from_ads), "by_status": count(rows, "status"), "by_priority": count(rows, "priority"),
            "interviews_done": sum(1 for r in rows if r["interview"] in ("done", "quiet")), "reports": sum(1 for r in rows if r["has_report"])}


class Handler(BaseHTTPRequestHandler):
    server_version = "karina-crm"

    def log_message(self, fmt, *args):  # no personal data in the journal
        pass

    def send(self, code: int, body: dict):
        raw = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def ip(self) -> str:
        fwd = self.headers.get("X-Real-IP") or (self.headers.get("X-Forwarded-For") or "").split(",")[0]
        return (fwd or self.client_address[0]).strip()[:64]

    def body(self):
        if "application/json" not in (self.headers.get("Content-Type") or ""):
            return None
        try:
            n = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return None
        if n <= 0 or n > MAX_BODY:
            return None
        try:
            d = json.loads(self.rfile.read(n))
            return d if isinstance(d, dict) else None
        except Exception:
            return None

    def authed(self) -> bool:
        h = self.headers.get("Authorization") or ""
        given = h[7:] if h.startswith("Bearer ") else ""
        return bool(PASSWORD) and hmac.compare_digest(given.encode(), PASSWORD.encode())

    # ---------------- routes
    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        path = u.path.rstrip("/")
        if path == "/api/health":
            return self.send(200, {"ok": True})
        if path == "/api/chat":
            return self.chat_get((q.get("token") or [""])[0])
        if path.startswith("/api/crm/"):
            if not self.authed():
                return self.send(401, {"ok": False})
            if path == "/api/crm/stats":
                return self.send(200, {"ok": True, "meta": meta_stats(), "site": site_stats(), "leads": lead_stats(), "now": now()})
            if path == "/api/crm/leads":
                with db() as con:
                    rows = con.execute("SELECT * FROM leads ORDER BY id DESC LIMIT 500").fetchall()
                return self.send(200, {"ok": True, "leads": [lead_view(r, False) for r in rows]})
            if path == "/api/crm/lead":
                with db() as con:
                    r = con.execute("SELECT * FROM leads WHERE id=?", ((q.get("id") or ["0"])[0],)).fetchone()
                return self.send(200, {"ok": True, "lead": lead_view(r, True)}) if r else self.send(404, {"ok": False})
        self.send(404, {"ok": False})

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path.rstrip("/")
        data = self.body()
        if data is None:
            return self.send(400, {"ok": False})
        if path == "/api/lead":
            return self.lead_post(data)
        if path == "/api/hit":
            return self.hit(data)
        if path == "/api/chat":
            return self.chat_post(data)
        if path == "/api/chat/finish":
            return self.chat_finish(data)
        if path.startswith("/api/crm/"):
            if not self.authed():
                return self.send(401, {"ok": False})
            if path == "/api/crm/lead":
                return self.crm_update(data)
            if path == "/api/crm/report":
                queue_report(int(data.get("id") or 0))
                return self.send(200, {"ok": True})
        self.send(404, {"ok": False})

    # ---------------- handlers
    def lead_post(self, data):
        if limited("lead:" + self.ip(), RATE):
            return self.send(429, {"ok": False})
        lead, why = clean(data)
        if why == "spam":
            return self.send(200, {"ok": True})
        if lead is None:
            return self.send(422, {"ok": False, "error": why})
        token = secrets.token_urlsafe(24)
        lead.update(created_at=now(), ip=self.ip(), user_agent=(self.headers.get("User-Agent") or "")[:300],
                    token=token, chat="[]", interview="none", last_activity=now(), updated_at=now())
        cols = ", ".join(lead)
        with db() as con:
            lead_id = con.execute(f"INSERT INTO leads ({cols}) VALUES ({', '.join('?' * len(lead))})", list(lead.values())).lastrowid
        threading.Thread(target=notify, args=(f"Outsistent · нова заявка #{lead_id}\n{lead['name']} · {lead['interest'] or '—'} · {lead['business'] or '—'}\nПривід: {lead['reason'][:200]}\n{SITE}/crm/#lead-{lead_id}",), daemon=True).start()
        self.send(200, {"ok": True, "id": lead_id, "token": token})

    def hit(self, data):
        ip = self.ip()
        if limited("hit:" + ip, HIT_RATE):
            return self.send(204, {})
        path = str(data.get("p") or "/")[:120]
        if path.startswith("/crm"):
            return self.send(204, {})
        qs = urllib.parse.parse_qs(str(data.get("q") or "").lstrip("?"))
        ref = urllib.parse.urlparse(str(data.get("r") or "")).hostname or ""
        if ref.endswith("karina.kovcheg.ai"):
            ref = ""
        src = (qs.get("utm_source") or [""])[0][:40]
        if not src and ("facebook" in ref or "instagram" in ref or qs.get("fbclid")):
            src = "meta"
        day = datetime.now(timezone.utc).date().isoformat()
        visitor = hashlib.sha256(f"{ip}|{self.headers.get('User-Agent','')}|{day}".encode()).hexdigest()[:16]
        ua = (self.headers.get("User-Agent") or "").lower()
        with db() as con:
            con.execute("INSERT INTO hits (ts, day, path, source, campaign, content, ref, visitor, mobile) VALUES (?,?,?,?,?,?,?,?,?)",
                        (now(), day, path, src, (qs.get("utm_campaign") or [""])[0][:60], (qs.get("utm_content") or [""])[0][:40],
                         ref[:80], visitor, int(any(m in ua for m in ("iphone", "android", "mobile")))))
        self.send(204, {})

    def lead_by_token(self, token: str):
        if not token or len(token) > 64:
            return None
        with db() as con:
            return con.execute("SELECT * FROM leads WHERE token=?", (token,)).fetchone()

    def chat_get(self, token):
        row = self.lead_by_token(token)
        if not row:
            return self.send(404, {"ok": False})
        chat = json.loads(row["chat"] or "[]")
        done = row["interview"] in ("done", "quiet")
        if not chat and not done:
            try:
                turn = interviewer_turn(row, chat)
            except Exception:
                return self.send(503, {"ok": False})
            chat.append({"role": "assistant", "text": turn["reply"][:1500], "t": now()})
            with db() as con:
                con.execute("UPDATE leads SET chat=?, interview='active', status=CASE WHEN status='new' THEN 'interview' ELSE status END, last_activity=?, updated_at=? WHERE id=?",
                            (json.dumps(chat, ensure_ascii=False), now(), now(), row["id"]))
        self.send(200, {"ok": True, "messages": [{"role": m["role"], "text": m["text"]} for m in chat], "done": done})

    def chat_post(self, data):
        if limited("chat:" + self.ip(), CHAT_RATE):
            return self.send(429, {"ok": False})
        row = self.lead_by_token(str(data.get("token") or ""))
        text = str(data.get("message") or "").strip()[:1500]
        if not row or not text:
            return self.send(404 if not row else 400, {"ok": False})
        if row["interview"] in ("done", "quiet"):
            return self.send(200, {"ok": True, "reply": "", "done": True})
        chat = json.loads(row["chat"] or "[]")
        chat.append({"role": "client", "text": text, "t": now()})
        client_msgs = sum(1 for m in chat if m["role"] == "client")
        try:
            turn = interviewer_turn(row, chat)
        except Exception:
            with db() as con:
                con.execute("UPDATE leads SET chat=?, last_activity=? WHERE id=?", (json.dumps(chat, ensure_ascii=False), now(), row["id"]))
            return self.send(503, {"ok": False})
        done = bool(turn["done"]) or client_msgs >= MAX_CLIENT_MSGS
        chat.append({"role": "assistant", "text": turn["reply"][:1500], "t": now()})
        with db() as con:
            con.execute("UPDATE leads SET chat=?, interview=?, last_activity=?, updated_at=? WHERE id=?",
                        (json.dumps(chat, ensure_ascii=False), "done" if done else "active", now(), now(), row["id"]))
        if done:
            queue_report(row["id"])
        self.send(200, {"ok": True, "reply": turn["reply"], "done": done})

    def chat_finish(self, data):
        row = self.lead_by_token(str(data.get("token") or ""))
        if not row:
            return self.send(404, {"ok": False})
        with db() as con:
            con.execute("UPDATE leads SET interview='done', last_activity=?, updated_at=? WHERE id=?", (now(), now(), row["id"]))
        queue_report(row["id"])
        self.send(200, {"ok": True})

    def crm_update(self, data):
        try:
            lead_id = int(data.get("id"))
        except (TypeError, ValueError):
            return self.send(400, {"ok": False})
        sets, vals = [], []
        if data.get("status") in STATUSES:
            sets.append("status=?"); vals.append(data["status"])
        if isinstance(data.get("notes"), str):
            sets.append("notes=?"); vals.append(data["notes"][:5000])
        if not sets:
            return self.send(400, {"ok": False})
        with db() as con:
            con.execute(f"UPDATE leads SET {', '.join(sets)}, updated_at=? WHERE id=?", (*vals, now(), lead_id))
        self.send(200, {"ok": True})


def main():
    global DB_PATH, PASSWORD
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--host", default="100.91.124.2")
    ap.add_argument("--port", type=int, default=3240)
    ap.add_argument("--db", type=Path, default=HERE / "leads.db")
    ap.add_argument("--password-file", type=Path, default=HERE / ".crm-password")
    a = ap.parse_args()
    DB_PATH = a.db
    if not a.password_file.exists():
        a.password_file.write_text(secrets.token_urlsafe(18) + "\n")
        a.password_file.chmod(0o600)
    PASSWORD = a.password_file.read_text().strip()
    migrate()
    threading.Thread(target=report_worker, daemon=True).start()
    threading.Thread(target=sweeper, daemon=True).start()
    srv = ThreadingHTTPServer((a.host, a.port), Handler)
    print(f"karina-crm on {a.host}:{a.port}, db {DB_PATH}", flush=True)
    srv.serve_forever()


if __name__ == "__main__":
    main()
