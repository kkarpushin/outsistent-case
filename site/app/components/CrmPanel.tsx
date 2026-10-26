"use client";

import {
  BarChart3,
  Bot,
  CalendarClock,
  ClipboardList,
  FileText,
  Flame,
  Inbox,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  Send,
  Snowflake,
  Sun,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Lead = Record<string, any>;

const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Нова", cls: "bg-paper text-ink" },
  interview: { label: "Інтерв'ю", cls: "bg-tint text-teal-deep" },
  report: { label: "Бриф готовий", cls: "bg-teal text-ink" },
  contacted: { label: "Зв'язались", cls: "bg-[#e8ecff] text-[#2d3a8c]" },
  client: { label: "Клієнт", cls: "bg-ink text-teal" },
  lost: { label: "Відмова", cls: "bg-[#f3f3f3] text-muted line-through" },
};
const PRIORITY: Record<string, { label: string; icon: typeof Flame; cls: string }> = {
  hot: { label: "гаряча", icon: Flame, cls: "text-risk-critical" },
  warm: { label: "тепла", icon: Sun, cls: "text-risk-important" },
  cold: { label: "холодна", icon: Snowflake, cls: "text-muted" },
};
const FIELDS: [string, string][] = [
  ["interest", "Цікавить"], ["business", "Форма бізнесу"], ["fop_count", "ФОП"], ["tov_count", "ТОВ"],
  ["activity", "Чим займається"], ["turnover", "Оборот"], ["bookkeeping", "Облік веде"], ["bank_requests", "Запити банку"], ["reason", "Привід"],
];

function when(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/* tiny markdown for the brief: ## headings, - lists, **bold**, paragraphs */
function Md({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : <span key={i}>{p}</span>));
  const flush = () => {
    if (list.length) {
      blocks.push(<ul key={blocks.length} className="my-2 list-disc space-y-1 pl-5">{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>);
      list = [];
    }
  };
  for (const raw of text.split("\n")) {
    const l = raw.trim();
    if (/^[-*] /.test(l) || /^\d+\. /.test(l)) { list.push(l.replace(/^([-*]|\d+\.) /, "")); continue; }
    flush();
    if (!l) continue;
    if (l.startsWith("#")) blocks.push(<h3 key={blocks.length} className="mt-5 text-[17px] font-bold text-ink first:mt-0">{l.replace(/^#+\s*/, "")}</h3>);
    else blocks.push(<p key={blocks.length} className="my-2">{inline(l)}</p>);
  }
  flush();
  return <div className="text-[15.5px] leading-relaxed text-text/90">{blocks}</div>;
}

export default function CrmPanel() {
  const [pass, setPass] = useState("");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [active, setActive] = useState<Lead | null>(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");

  const api = useCallback(
    async (path: string, body?: object) => {
      const r = await fetch(path, {
        method: body ? "POST" : "GET",
        headers: { Authorization: `Bearer ${pass}`, ...(body ? { "Content-Type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (r.status === 401) throw new Error("auth");
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    },
    [pass],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api("/api/crm/leads");
      setLeads(d.leads);
      setAuthed(true);
      setError("");
      try { sessionStorage.setItem("crm-pass", pass); } catch {}
    } catch (e: any) {
      setAuthed(false);
      setError(e.message === "auth" ? "Невірний пароль" : "Сервер не відповідає");
    } finally {
      setLoading(false);
    }
  }, [api, pass]);

  const open = useCallback(
    async (id: number) => {
      const d = await api(`/api/crm/lead?id=${id}`);
      setActive(d.lead);
      setNotes(d.lead.notes || "");
      try { history.replaceState(null, "", `#lead-${id}`); } catch {}
    },
    [api],
  );

  useEffect(() => {
    try {
      const p = sessionStorage.getItem("crm-pass");
      if (p) setPass(p);
    } catch {}
  }, []);
  useEffect(() => {
    if (pass && !authed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pass]);
  useEffect(() => {
    const m = location.hash.match(/^#lead-(\d+)$/);
    if (authed && m) open(Number(m[1])).catch(() => {});
  }, [authed, open]);

  const shown = useMemo(() => leads.filter((l) => filter === "all" || l.status === filter), [leads, filter]);
  const counts = useMemo(() => leads.reduce((a: Record<string, number>, l) => ((a[l.status] = (a[l.status] || 0) + 1), a), {}), [leads]);

  async function setStatus(status: string) {
    if (!active) return;
    await api("/api/crm/lead", { id: active.id, status });
    setActive({ ...active, status });
    setLeads((ls) => ls.map((l) => (l.id === active.id ? { ...l, status } : l)));
  }

  if (!authed) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="mx-auto mt-16 max-w-[420px] rounded-[28px] border border-line bg-white p-8"
      >
        <KeyRound className="size-8 text-teal-deep" aria-hidden />
        <h1 className="mt-4 text-2xl font-extrabold">CRM Outsistent</h1>
        <p className="mt-1 text-[15px] text-muted">Заявки з сайту, інтерв&apos;ю та брифи. Вхід лише для Карини.</p>
        <label htmlFor="crm-pass" className="mt-6 block text-sm font-bold text-ink">Пароль</label>
        <input id="crm-pass" type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" className="mt-2 w-full rounded-2xl border border-line px-4 py-3 outline-none focus:border-teal focus:ring-4 focus:ring-teal/25" />
        {error && <p className="mt-3 text-sm font-semibold text-risk-critical">{error}</p>}
        <button type="submit" className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 font-bold text-ink">
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <KeyRound className="size-4" aria-hidden />} Увійти
        </button>
      </form>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="Outsistent" className="h-9 w-auto" />
          <span className="rounded-full bg-ink px-3 py-1 text-sm font-bold text-teal">CRM</span>
          <a href="/crm/stats/" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-ink ring-1 ring-line hover:ring-teal">
            <BarChart3 className="size-4 text-teal-deep" aria-hidden /> Реклама і статистика
          </a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden /> Оновити
          </button>
          <button
            onClick={() => {
              try { sessionStorage.removeItem("crm-pass"); } catch {}
              setAuthed(false);
              setPass("");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-muted"
          >
            <LogOut className="size-4" aria-hidden /> Вийти
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {[["all", "Усі"], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${filter === k ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line"}`}>
            {label} <span className="opacity-60">{k === "all" ? leads.length : counts[k] || 0}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
        <ul className="grid content-start gap-2">
          {shown.length === 0 && (
            <li className="flex items-center gap-3 rounded-2xl bg-white p-5 text-muted ring-1 ring-line">
              <Inbox className="size-5" aria-hidden /> Заявок поки немає. Нові з&apos;являться тут одразу після анкети.
            </li>
          )}
          {shown.map((l) => {
            const pr = PRIORITY[l.priority];
            return (
              <li key={l.id}>
                <button onClick={() => open(l.id)} className={`w-full rounded-2xl bg-white p-4 text-left ring-1 transition-shadow hover:shadow-[0_10px_30px_-20px_rgba(17,20,27,0.5)] ${active?.id === l.id ? "ring-2 ring-teal" : "ring-line"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-ink">{l.name}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS[l.status]?.cls || ""}`}>{STATUS[l.status]?.label || l.status}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-text/75">{l.report_summary || l.activity}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1"><CalendarClock className="size-3.5" aria-hidden />{when(l.created_at)}</span>
                    {l.interest && <span className="flex items-center gap-1"><ClipboardList className="size-3.5" aria-hidden />{l.interest}</span>}
                    {pr && <span className={`flex items-center gap-1 font-semibold ${pr.cls}`}><pr.icon className="size-3.5" aria-hidden />{pr.label}</span>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <section className="min-w-0">
          {!active ? (
            <div className="grid h-full min-h-[300px] place-items-center rounded-[28px] bg-white text-muted ring-1 ring-line">Оберіть заявку зліва</div>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-[28px] bg-white p-6 ring-1 ring-line">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-extrabold">{active.name}</h2>
                    <p className="mt-1 text-sm text-muted">Заявка #{active.id} · {when(active.created_at)}</p>
                  </div>
                  {PRIORITY[active.priority] && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-sm font-bold ${PRIORITY[active.priority].cls}`}>
                      {(() => { const I = PRIORITY[active.priority].icon; return <I className="size-4" aria-hidden />; })()}
                      {PRIORITY[active.priority].label}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <a href={`tel:${active.phone}`} className="inline-flex items-center gap-2 rounded-full bg-paper px-3.5 py-2 font-semibold"><Phone className="size-4 text-teal-deep" aria-hidden />{active.phone}</a>
                  <span className="inline-flex items-center gap-2 rounded-full bg-paper px-3.5 py-2 font-semibold"><Mail className="size-4 text-teal-deep" aria-hidden />{active.email}</span>
                  {active.telegram && <span className="inline-flex items-center gap-2 rounded-full bg-paper px-3.5 py-2 font-semibold"><Send className="size-4 text-teal-deep" aria-hidden />{active.telegram}</span>}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {Object.entries(STATUS).map(([k, v]) => (
                    <button key={k} onClick={() => setStatus(k)} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${active.status === k ? "bg-ink text-white" : "bg-paper text-ink hover:bg-tint"}`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 ring-1 ring-line">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-lg font-bold"><FileText className="size-5 text-teal-deep" aria-hidden />Бриф від агента-звітника</h3>
                  <button onClick={() => api("/api/crm/report", { id: active.id }).then(() => setActive({ ...active, report_error: null, _queued: true }))} className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-deep">
                    <RefreshCw className="size-4" aria-hidden /> Перегенерувати
                  </button>
                </div>
                {active.recommended && (
                  <p className="mt-3 rounded-2xl bg-tint px-4 py-3 text-[15px] font-semibold text-teal-deep">Пропонувати: {active.recommended}</p>
                )}
                <div className="mt-4">
                  {active.report_md ? (
                    <Md text={active.report_md} />
                  ) : (
                    <p className="text-[15px] text-muted">
                      {active._queued ? "Бриф поставлено в чергу." : "Бриф ще не готовий: агент пише його після інтерв'ю або через 30 хвилин тиші."}
                      {active.report_error && " Остання спроба не вдалася, повторимо автоматично."}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-[28px] bg-white p-6 ring-1 ring-line">
                  <h3 className="flex items-center gap-2 text-lg font-bold"><ClipboardList className="size-5 text-teal-deep" aria-hidden />Анкета</h3>
                  <dl className="mt-4 grid gap-2.5 text-[15px]">
                    {FIELDS.filter(([k]) => active[k]).map(([k, label]) => (
                      <div key={k}>
                        <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{label}</dt>
                        <dd className="text-ink">{active[k]}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="rounded-[28px] bg-white p-6 ring-1 ring-line">
                  <h3 className="flex items-center gap-2 text-lg font-bold"><MessageSquareText className="size-5 text-teal-deep" aria-hidden />Інтерв&apos;ю</h3>
                  <div className="mt-4 grid max-h-[480px] gap-3 overflow-y-auto">
                    {(active.chat || []).length === 0 && <p className="text-[15px] text-muted">Клієнт не відкривав чат.</p>}
                    {(active.chat || []).map((m: any, i: number) => (
                      <div key={i} className="flex gap-2.5">
                        <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${m.role === "client" ? "bg-ink text-teal" : "bg-teal text-ink"}`}>
                          {m.role === "client" ? <UserRound className="size-3.5" aria-hidden /> : <Bot className="size-3.5" aria-hidden />}
                        </span>
                        <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">{m.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 ring-1 ring-line">
                <label htmlFor="crm-notes" className="flex items-center gap-2 text-lg font-bold"><FileText className="size-5 text-teal-deep" aria-hidden />Нотатки Карини</label>
                <textarea id="crm-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-3 w-full rounded-2xl border border-line px-4 py-3 text-[15px] outline-none focus:border-teal focus:ring-4 focus:ring-teal/25" placeholder="Що домовились, наступний крок…" />
                <button onClick={() => api("/api/crm/lead", { id: active.id, notes })} className="mt-3 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white">Зберегти</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
