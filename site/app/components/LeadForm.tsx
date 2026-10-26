"use client";

import { AlarmClock, CheckCircle2, Loader2, Lock, Send, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import InterviewChat from "./InterviewChat";
import { PHONE, PHONE_HREF, REPLY_TIME, TELEGRAM } from "./ui";

const BUSINESS = ["ФОП", "ТОВ", "ФОП і ТОВ", "Інше"];
const TURNOVER = ["до 2 млн грн", "2–5 млн грн", "5–10 млн грн", "10–20 млн грн", "20–40 млн грн", "понад 40 млн грн"];
const BOOKKEEPING = ["Сам власник", "Штатний бухгалтер", "Бухгалтер на аутсорсі", "Інше"];
const BANK = ["Так", "Ні", "Зараз є запит"];
const INTEREST = ["Експрес-перевірка «Очима банку»", "Аудит фінансової безпеки", "Супровід ФОП або ТОВ", "Консультація"];

type Status = "idle" | "sending" | "done" | "error";

function Radio({ name, options, value, onChange }: { name: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const id = `${name}-${o}`;
        return (
          <label
            key={o}
            htmlFor={id}
            className={`cursor-pointer rounded-full border px-4 py-2 text-[16px] font-semibold transition-colors ${
              value === o ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-teal"
            }`}
          >
            <input id={id} type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="sr-only" />
            {o}
          </label>
        );
      })}
    </div>
  );
}

const field = "w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[16px] text-ink outline-none transition-shadow placeholder:text-muted/70 focus:border-teal focus:ring-4 focus:ring-teal/25";
const label = "mb-2 block text-[16px] font-bold text-ink";

export default function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [business, setBusiness] = useState("");
  const [turnover, setTurnover] = useState("");
  const [bookkeeping, setBookkeeping] = useState("");
  const [bank, setBank] = useState("");
  const [interest, setInterest] = useState(INTEREST[0]);
  const [meta, setMeta] = useState<Record<string, string>>({});
  const [token, setToken] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const m: Record<string, string> = { page: document.referrer || "" };
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "service"].forEach((k) => {
      const v = q.get(k);
      if (v) m[k] = v;
    });
    if (m.service === "audyt") setInterest(INTEREST[1]);
    if (m.service === "suprovid") setInterest(INTEREST[2]);
    setMeta(m);
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      telegram: String(fd.get("telegram") || "").trim(),
      business,
      fop_count: String(fd.get("fop_count") || ""),
      tov_count: String(fd.get("tov_count") || ""),
      activity: String(fd.get("activity") || "").trim(),
      turnover,
      bookkeeping,
      bank_requests: bank,
      reason: String(fd.get("reason") || "").trim(),
      interest,
      consent: fd.get("consent") === "on",
      website: String(fd.get("website") || ""),
      meta,
    };
    setStatus("sending");
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json().catch(() => ({}));
      if (d.token) setToken(d.token);
      try {
        (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.("track", "SubmitApplication", { content_name: interest });
      } catch {}
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "done" && token) {
    return <InterviewChat token={token} />;
  }

  if (status === "done") {
    return (
      <div className="rounded-[28px] border border-line bg-white p-8 text-center md:p-12" role="status">
        <CheckCircle2 className="mx-auto size-14 text-teal" aria-hidden />
        <h2 className="mt-5 text-3xl font-extrabold">Дякую! Анкету отримано</h2>
        <p className="mx-auto mt-3 max-w-[440px] text-[17px] leading-relaxed text-text/80">
          Я перегляну відповіді й напишу вам {REPLY_TIME}. Якщо питання термінове — напишіть у Telegram.
        </p>
        <a href={TELEGRAM} target="_blank" rel="noopener" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#039be5] px-5 py-3 font-bold text-white">
          <Send className="size-4" aria-hidden /> Telegram @outsistentZP
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-7 rounded-[28px] border border-line bg-white p-6 md:p-10" noValidate={false}>
      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-muted">Контакти</legend>
        <div className="md:col-span-2">
          <label htmlFor="name" className={label}>Ім&apos;я та прізвище *</label>
          <input id="name" name="name" required autoComplete="name" className={field} placeholder="Олена Коваль" />
        </div>
        <div>
          <label htmlFor="phone" className={label}>Телефон *</label>
          <input id="phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" pattern="[0-9 +()\-]{9,20}" className={field} placeholder="+38 0__ ___ __ __" />
        </div>
        <div>
          <label htmlFor="email" className={label}>Електронна пошта *</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={field} placeholder="name@company.ua" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="telegram" className={label}>Telegram <span className="font-normal text-muted">(якщо зручніше там)</span></label>
          <input id="telegram" name="telegram" className={field} placeholder="@nickname" />
        </div>
      </fieldset>

      <fieldset className="grid gap-6">
        <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-muted">Ваш бізнес</legend>
        <div>
          <p className={label}>Що вас цікавить</p>
          <Radio name="interest" options={INTEREST} value={interest} onChange={setInterest} />
        </div>
        <div>
          <p className={label}>Форма бізнесу</p>
          <Radio name="business" options={BUSINESS} value={business} onChange={setBusiness} />
        </div>
        {(business === "ФОП" || business === "ФОП і ТОВ" || business === "Інше") && (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="fop_count" className={label}>Скільки ФОП у структурі</label>
              <input id="fop_count" name="fop_count" type="number" min={0} max={99} className={field} placeholder="2" />
            </div>
            {business !== "ФОП" && (
              <div>
                <label htmlFor="tov_count" className={label}>Скільки ТОВ</label>
                <input id="tov_count" name="tov_count" type="number" min={0} max={99} className={field} placeholder="1" />
              </div>
            )}
          </div>
        )}
        {business === "ТОВ" && (
          <div className="md:max-w-[50%]">
            <label htmlFor="tov_count" className={label}>Скільки ТОВ у структурі</label>
            <input id="tov_count" name="tov_count" type="number" min={0} max={99} className={field} placeholder="1" />
          </div>
        )}
        <div>
          <label htmlFor="activity" className={label}>Чим займається бізнес *</label>
          <input id="activity" name="activity" required className={field} placeholder="Коротко: торгівля на маркетплейсі, виробництво, послуги…" />
        </div>
        <div>
          <p className={label}>Річний оборот</p>
          <Radio name="turnover" options={TURNOVER} value={turnover} onChange={setTurnover} />
        </div>
        <div>
          <p className={label}>Хто веде облік</p>
          <Radio name="bookkeeping" options={BOOKKEEPING} value={bookkeeping} onChange={setBookkeeping} />
        </div>
        <div>
          <p className={label}>Чи були запити від банку за останні 12 місяців</p>
          <Radio name="bank" options={BANK} value={bank} onChange={setBank} />
        </div>
        <div>
          <label htmlFor="reason" className={label}>Що стало приводом звернутися *</label>
          <textarea id="reason" name="reason" required rows={4} className={field} placeholder="Наприклад: банк попросив документи, ростуть обороти, хочу перевірити бухгалтера…" />
        </div>
      </fieldset>

      {/* honeypot: people never see or fill it */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Сайт</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label htmlFor="consent" className="flex cursor-pointer items-start gap-3 text-[16px] leading-snug text-text/80">
        <input id="consent" name="consent" type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-[#0d7773]" />
        <span>
          Погоджуюсь на обробку персональних даних відповідно до{" "}
          <a href="/pryvatnist/" className="font-semibold text-teal-deep underline underline-offset-4">політики конфіденційності</a>.
        </span>
      </label>

      {status === "error" && (
        <p className="flex items-start gap-3 rounded-2xl bg-[#fde8e8] p-4 text-[16px] text-[#9b1c20]" role="alert">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <span>
            Не вдалося надіслати анкету. Спробуйте ще раз або напишіть у{" "}
            <a href={TELEGRAM} target="_blank" rel="noopener" className="font-bold underline">Telegram</a> чи зателефонуйте{" "}
            <a href={PHONE_HREF} className="font-bold underline">{PHONE}</a>.
          </span>
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center gap-3 rounded-full bg-teal py-2 pl-7 pr-2 text-[16px] font-bold text-ink transition-colors hover:bg-teal-hover disabled:opacity-70"
        >
          {status === "sending" ? "Надсилаю…" : "Надіслати анкету"}
          <span className="grid size-11 place-items-center rounded-full bg-ink text-teal">
            {status === "sending" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Send className="size-5" aria-hidden />}
          </span>
        </button>
        <div className="grid gap-1.5 text-sm text-muted">
          <span className="flex items-center gap-2"><AlarmClock className="size-4 text-teal-deep" aria-hidden />Відповідь {REPLY_TIME}</span>
          <span className="flex items-center gap-2"><Lock className="size-4 text-teal-deep" aria-hidden />Захищене з’єднання, без розсилок</span>
        </div>
      </div>
    </form>
  );
}
