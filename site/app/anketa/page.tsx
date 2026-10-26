import type { Metadata } from "next";
import { AlarmClock, BadgeCheck, ClipboardList, Phone, Send, Timer } from "lucide-react";
import Header from "../components/Header";
import LeadForm from "../components/LeadForm";
import { Footer } from "../components/Sections";
import { Eyebrow, PHONE, PHONE_HREF, REPLY_TIME, TELEGRAM } from "../components/ui";

export const metadata: Metadata = {
  title: "Анкета · Outsistent",
  description: "Коротка анкета про ваш бізнес, облік і податкову ситуацію. 5–7 хвилин, без оплати та зобов'язань.",
};

export default function Anketa() {
  return (
    <>
      <div className="bg-[#e3e3e4]">
        <Header current="/anketa/" />
        <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-10 md:px-8 md:pb-14">
          <Eyebrow icon={ClipboardList}>Анкета</Eyebrow>
          <h1 className="mt-5 max-w-[760px] text-[38px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[52px]">
            Розкажіть про бізнес — <span className="mk">я підкажу, з чого почати</span>
          </h1>
          <ul className="mt-6 flex flex-wrap gap-2">
            <li className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-sm font-semibold text-ink"><Timer className="size-4 text-teal-deep" aria-hidden />5–7 хвилин</li>
            <li className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-sm font-semibold text-ink"><BadgeCheck className="size-4 text-teal-deep" aria-hidden />без оплати та зобов&apos;язань</li>
            <li className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-sm font-semibold text-ink"><AlarmClock className="size-4 text-teal-deep" aria-hidden />відповідь {REPLY_TIME}</li>
          </ul>
        </div>
      </div>
      <main className="bg-paper px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <LeadForm />
          <aside className="grid content-start gap-4">
            <div className="rounded-[var(--radius-card)] bg-ink p-6 text-white">
              <img src="/images/karina-160.webp" alt="Карина Замкова" className="size-16 rounded-full border-2 border-teal object-cover" />
              <p className="mt-4 text-lg font-bold">Карина Замкова</p>
              <p className="text-sm text-white/60">податковий консультант · 15 років в обліку</p>
              <p className="mt-4 text-[16px] leading-relaxed text-white/80">За відповідями я попередньо оцінюю вашу ситуацію і пропоную наступний крок: експрес-перевірку, аудит чи супровід.</p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">Швидше голосом?</p>
              <a href={PHONE_HREF} className="mt-3 flex items-center gap-3 text-lg font-bold text-ink"><Phone className="size-5 text-teal-deep" aria-hidden />{PHONE}</a>
              <a href={TELEGRAM} target="_blank" rel="noopener" className="mt-2 flex items-center gap-3 text-[16px] font-semibold text-teal-deep"><Send className="size-5" aria-hidden />Telegram @outsistentZP</a>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
