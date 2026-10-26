"use client";

import {
  ArrowLeft,
  BadgeDollarSign,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  ClipboardList,
  Eye,
  Globe,
  KeyRound,
  Loader2,
  Monitor,
  MousePointerClick,
  RefreshCw,
  Smartphone,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Stats = Record<string, any>;

const usd = (v: number) => `$${(v || 0).toFixed(2)}`;
const int = (v: number) => Math.round(v || 0).toLocaleString("uk-UA");
const pct = (v: number) => `${(v || 0).toFixed(2)}%`;
const time = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }) : "");
const dt = (iso?: string) => (iso ? new Date(iso).toLocaleString("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

const PAGE_NAMES: Record<string, string> = {
  "/": "Головна", "/ochyma-banku/": "«Очима банку»", "/anketa/": "Анкета", "/audyt/": "Аудит", "/suprovid/": "Супровід",
  "/samoperevirka/": "Самоперевірка", "/pro-karynu/": "Про Карину", "/kontakty/": "Контакти", "/pryvatnist/": "Приватність",
};

function adStatus(s: string) {
  if (s === "ACTIVE") return { label: "Крутиться", icon: CircleCheck, cls: "bg-tint text-teal-deep" };
  if (s === "IN_PROCESS" || s === "PENDING_REVIEW") return { label: "На модерації", icon: CircleDashed, cls: "bg-[#fff3df] text-[#8a5300]" };
  if (s === "DISAPPROVED" || s === "WITH_ISSUES") return { label: "Відхилено", icon: CircleAlert, cls: "bg-[#fde8e8] text-[#9b1c20]" };
  return { label: s === "PAUSED" || s === "CAMPAIGN_PAUSED" || s === "ADSET_PAUSED" ? "На паузі" : s, icon: CircleDashed, cls: "bg-paper text-muted" };
}

function Tile({ icon: Icon, label, value, sub, children }: { icon: typeof Eye; label: string; value: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-white p-5 ring-1 ring-line">
      <p className="flex items-center gap-2 text-sm font-semibold text-muted"><Icon className="size-4 text-teal-deep" aria-hidden />{label}</p>
      <p className="mt-2 text-3xl font-extrabold tabular-nums text-ink">{value}</p>
      {sub && <p className="mt-1 text-sm text-text/70">{sub}</p>}
      {children}
    </div>
  );
}

export default function StatsPanel() {
  const [pass, setPass] = useState("");
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (p = pass) => {
    if (!p) return;
    setLoading(true);
    try {
      const r = await fetch("/api/crm/stats", { headers: { Authorization: `Bearer ${p}` } });
      if (r.status === 401) throw new Error("auth");
      if (!r.ok) throw new Error("server");
      setData(await r.json());
      setError("");
      try { sessionStorage.setItem("crm-pass", p); } catch {}
    } catch (e: any) {
      setError(e.message === "auth" ? "Невірний пароль" : "Сервер не відповідає");
      if (e.message === "auth") setData(null);
    } finally {
      setLoading(false);
    }
  }, [pass]);

  useEffect(() => {
    try {
      const p = sessionStorage.getItem("crm-pass");
      if (p) { setPass(p); load(p); }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!data) return;
    const t = setInterval(() => load(), 60_000);
    return () => clearInterval(t);
  }, [data, load]);

  if (!data) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="mx-auto mt-16 max-w-[420px] rounded-[28px] border border-line bg-white p-8">
        <KeyRound className="size-8 text-teal-deep" aria-hidden />
        <h1 className="mt-4 text-2xl font-extrabold">Реклама і статистика</h1>
        <p className="mt-1 text-[15px] text-muted">Той самий пароль, що й до CRM.</p>
        <label htmlFor="stats-pass" className="mt-6 block text-sm font-bold text-ink">Пароль</label>
        <input id="stats-pass" type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="mt-2 w-full rounded-2xl border border-line px-4 py-3 outline-none focus:border-teal focus:ring-4 focus:ring-teal/25" />
        {error && <p className="mt-3 text-sm font-semibold text-risk-critical">{error}</p>}
        <button type="submit" className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 font-bold text-ink">
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <KeyRound className="size-4" aria-hidden />} Увійти
        </button>
      </form>
    );
  }

  const m = data.meta || {};
  const c = (m.campaigns || [])[0] || {};
  const site = data.site || {};
  const leads = data.leads || {};
  const cost = c.applications ? c.spend / c.applications : 0;
  const budgetShare = c.budget ? Math.min(100, (c.spend / c.budget) * 100) : 0;
  const funnel = [
    { label: "Покази", v: c.impressions || 0 },
    { label: "Кліки по посиланню", v: c.clicks || 0 },
    { label: "Перегляди лендингу (Meta)", v: c.lpv || 0 },
    { label: "Відвідувачі з реклами (сайт)", v: site.ad_visitors || 0 },
    { label: "Анкети з реклами (CRM)", v: leads.from_ads || 0 },
  ];
  const fmax = Math.max(1, ...funnel.map((f) => f.v));
  const daily = (m.daily || []).slice(-14);
  const dmax = Math.max(0.01, ...daily.map((d: any) => d.spend));
  const visitsByAd: Record<string, any> = Object.fromEntries((site.by_ad || []).map((r: any) => [r.content, r]));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <img src="/images/logo.png" alt="Outsistent" className="h-9 w-auto" />
          <a href="/crm/" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-ink ring-1 ring-line hover:ring-teal">
            <ArrowLeft className="size-4" aria-hidden /> Заявки
          </a>
          <span className="rounded-full bg-ink px-3 py-1 text-sm font-bold text-teal">Реклама і статистика</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>Оновлено о {time(data.now)} · Meta о {time(m.fetched_at)} (кеш 10 хв)</span>
          <button onClick={() => load()} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 font-semibold text-ink">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden /> Оновити
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] bg-ink p-5 text-white">
        <p className="text-sm text-white/60">Кампанія</p>
        <p className="mt-1 text-lg font-bold">{c.name || "—"}</p>
        <p className="mt-1 text-sm text-white/70">Кабінет Ковчега · сторінка «Константин Карпушин» · тест до 29.10 · оптимізація на подану анкету</p>
        {m.error && <p className="mt-2 text-sm text-risk-important">Meta не відповіла: {m.error}</p>}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Tile icon={BadgeDollarSign} label="Витрачено" value={usd(c.spend)} sub={`з ${usd(c.budget)} бюджету`}>
          <div className="mt-3 h-2 rounded-full bg-paper"><div className="h-2 rounded-full bg-teal-deep" style={{ width: `${budgetShare}%` }} /></div>
        </Tile>
        <Tile icon={Eye} label="Покази" value={int(c.impressions)} sub={`охоплення ${int(c.reach)} · CPM ${usd(c.cpm)}`} />
        <Tile icon={MousePointerClick} label="Кліки по посиланню" value={int(c.clicks)} sub={`CTR ${pct(c.ctr)} · клік ${usd(c.cpc)}`} />
        <Tile icon={Users} label="Заходи з реклами" value={int(site.ad_visitors)} sub={`усього відвідувачів ${int(site.visitors)}`} />
        <Tile icon={ClipboardList} label="Анкети" value={int(leads.from_ads)} sub={`з реклами · усього в CRM ${int(leads.total)} · піксель ${int(c.applications)}`} />
        <Tile icon={BadgeDollarSign} label="Ціна анкети" value={cost ? usd(cost) : "—"} sub="за даними пікселя Meta" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-[20px] bg-white p-6 ring-1 ring-line">
          <h2 className="text-lg font-bold">Шлях від показу до анкети</h2>
          <ul className="mt-5 grid gap-3">
            {funnel.map((f) => (
              <li key={f.label} className="grid grid-cols-[minmax(0,190px)_minmax(0,1fr)_64px] items-center gap-3 text-sm">
                <span className="text-text/80">{f.label}</span>
                <span className="h-3 rounded-r-[4px] bg-teal-deep" style={{ width: `${Math.max(1.5, (f.v / fmax) * 100)}%` }} title={`${f.label}: ${int(f.v)}`} />
                <span className="text-right font-bold tabular-nums text-ink">{int(f.v)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[20px] bg-white p-6 ring-1 ring-line">
          <h2 className="text-lg font-bold">Витрати по днях</h2>
          {daily.length === 0 ? (
            <p className="mt-4 text-[15px] text-muted">Ще немає витрат: оголошення щойно стартували.</p>
          ) : (
            <div className="mt-5 flex h-40 items-end gap-2 border-b border-line">
              {daily.map((d: any) => (
                <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: "100%" }}>
                  <div className="w-full max-w-[56px] rounded-t-[4px] bg-teal-deep" style={{ height: `${Math.max(2, (d.spend / dmax) * 100)}%` }} />
                  <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white group-hover:block">
                    {d.day}: {usd(d.spend)} · {int(d.impressions)} показів · {int(d.clicks)} кліків
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex gap-2 text-xs text-muted">
            {daily.map((d: any) => <span key={d.day} className="flex-1 text-center">{d.day?.slice(5)}</span>)}
          </div>
        </section>
      </div>

      <section className="mt-4 overflow-x-auto rounded-[20px] bg-white p-6 ring-1 ring-line">
        <h2 className="text-lg font-bold">Оголошення</h2>
        <table className="mt-4 w-full min-w-[860px] text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="pb-2 font-semibold">Оголошення</th><th className="pb-2 font-semibold">Статус</th>
              <th className="pb-2 text-right font-semibold">Витрачено</th><th className="pb-2 text-right font-semibold">Покази</th>
              <th className="pb-2 text-right font-semibold">Кліки</th><th className="pb-2 text-right font-semibold">CTR</th>
              <th className="pb-2 text-right font-semibold">Клік</th><th className="pb-2 text-right font-semibold">Заходи (сайт)</th>
              <th className="pb-2 text-right font-semibold">Анкети</th>
            </tr>
          </thead>
          <tbody>
            {(m.ads || []).map((a: any) => {
              const code = (a.name || "").split(" ")[0];
              const st = adStatus(a.status);
              return (
                <tr key={a.id} className="border-t border-line align-middle">
                  <td className="py-3">
                    <span className="flex items-center gap-3">
                      <img src={`/ads/${code}.jpg`} alt="" className="h-14 w-11 rounded-md object-cover ring-1 ring-line" />
                      <span className="font-semibold text-ink">{a.name}</span>
                    </span>
                  </td>
                  <td className="py-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${st.cls}`}><st.icon className="size-3.5" aria-hidden />{st.label}</span></td>
                  <td className="py-3 text-right tabular-nums">{usd(a.spend)}</td>
                  <td className="py-3 text-right tabular-nums">{int(a.impressions)}</td>
                  <td className="py-3 text-right tabular-nums">{int(a.clicks)}</td>
                  <td className="py-3 text-right tabular-nums">{pct(a.ctr)}</td>
                  <td className="py-3 text-right tabular-nums">{a.cpc ? usd(a.cpc) : "—"}</td>
                  <td className="py-3 text-right tabular-nums">{int(visitsByAd[code]?.u || 0)}</td>
                  <td className="py-3 text-right font-bold tabular-nums">{int(a.applications)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="rounded-[20px] bg-white p-6 ring-1 ring-line">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Globe className="size-5 text-teal-deep" aria-hidden />Сторінки</h2>
          <p className="mt-1 text-sm text-muted">Сьогодні {int(site.today_visitors)} відвідувачів · {int(site.today_visits)} переглядів</p>
          <table className="mt-4 w-full text-sm">
            <thead><tr className="text-left text-muted"><th className="pb-2 font-semibold">Сторінка</th><th className="pb-2 text-right font-semibold">Перегляди</th><th className="pb-2 text-right font-semibold">Люди</th></tr></thead>
            <tbody>
              {(site.by_page || []).map((r: any) => (
                <tr key={r.path} className="border-t border-line"><td className="py-2">{PAGE_NAMES[r.path] || r.path}</td><td className="py-2 text-right tabular-nums">{int(r.n)}</td><td className="py-2 text-right tabular-nums">{int(r.u)}</td></tr>
              ))}
              {(site.by_page || []).length === 0 && <tr><td className="py-2 text-muted" colSpan={3}>Заходів ще немає.</td></tr>}
            </tbody>
          </table>
        </section>
        <section className="rounded-[20px] bg-white p-6 ring-1 ring-line">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Users className="size-5 text-teal-deep" aria-hidden />Звідки приходять</h2>
          <p className="mt-1 flex items-center gap-3 text-sm text-muted">
            <span className="flex items-center gap-1"><Smartphone className="size-4" aria-hidden />телефон {Math.round((site.mobile_share || 0) * 100)}%</span>
            <span className="flex items-center gap-1"><Monitor className="size-4" aria-hidden />комп&apos;ютер {100 - Math.round((site.mobile_share || 0) * 100)}%</span>
          </p>
          <table className="mt-4 w-full text-sm">
            <thead><tr className="text-left text-muted"><th className="pb-2 font-semibold">Джерело</th><th className="pb-2 text-right font-semibold">Перегляди</th><th className="pb-2 text-right font-semibold">Люди</th></tr></thead>
            <tbody>
              {(site.by_source || []).map((r: any) => (
                <tr key={r.src} className="border-t border-line"><td className="py-2">{r.src === "meta" ? "Реклама Meta" : r.src}</td><td className="py-2 text-right tabular-nums">{int(r.n)}</td><td className="py-2 text-right tabular-nums">{int(r.u)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="rounded-[20px] bg-white p-6 ring-1 ring-line">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Eye className="size-5 text-teal-deep" aria-hidden />Останні заходи</h2>
          <ul className="mt-4 grid max-h-[340px] gap-2 overflow-y-auto text-sm">
            {(site.recent || []).map((h: any, i: number) => (
              <li key={i} className="flex items-center gap-2 border-t border-line pt-2 first:border-t-0 first:pt-0">
                {h.mobile ? <Smartphone className="size-4 shrink-0 text-muted" aria-hidden /> : <Monitor className="size-4 shrink-0 text-muted" aria-hidden />}
                <span className="w-24 shrink-0 tabular-nums text-muted">{dt(h.ts)}</span>
                <span className="flex-1 truncate">{PAGE_NAMES[h.path] || h.path}</span>
                <span className="shrink-0 rounded-full bg-paper px-2 py-0.5 text-xs font-semibold">{h.source === "meta" ? `Meta ${h.content || ""}` : h.ref || "прямий"}</span>
              </li>
            ))}
            {(site.recent || []).length === 0 && <li className="text-muted">Заходів ще немає.</li>}
          </ul>
        </section>
      </div>
      <p className="mt-4 text-xs text-muted">Покази, кліки й витрати — з Meta (оновлення раз на 10 хв, Meta сама відстає на кілька хвилин). Заходи — власний лічильник сайту без cookie. Анкети — з бази CRM.</p>
    </div>
  );
}
