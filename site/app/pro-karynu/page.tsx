import type { Metadata } from "next";
import {
  Banknote,
  BookOpen,
  Briefcase,
  Building2,
  Eye,
  FileText,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  Quote,
  Scale,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Header from "../components/Header";
import { FinalCta, Footer, Reviews } from "../components/Sections";
import { ArrowSwoop, Cta, Eyebrow, IconTile, Section } from "../components/ui";

export const metadata: Metadata = {
  title: "Карина Замкова · Outsistent",
  description: "Податковий консультант, 15 років в обліку, юридична освіта. Засновниця бухгалтерської компанії «Аутсістент».",
};

const path = [
  { icon: Briefcase, year: "2010", text: "Початок кар'єри в обліку." },
  { icon: GraduationCap, year: "2013", text: "Друга вища освіта — юридична." },
  { icon: Building2, year: "2019", text: "Власна бухгалтерська компанія «Аутсістент»." },
  { icon: ShieldCheck, year: "2026", text: "Аудит фінансової безпеки для власників ФОП і ТОВ." },
];

const principles = [
  { icon: Eye, title: "Незалежний погляд", text: "«Бухгалтер веде облік. Консультант допомагає розібратися, перевірити, поставити під сумнів і прийняти рішення.»" },
  { icon: HeartHandshake, title: "Без паніки", text: "«Аудит — не вирок.» Спокійний розбір і конкретний план замість страшилок." },
  { icon: Scale, title: "Рішення за власником", text: "«Фінальні рішення завжди залишаються за власником бізнесу.» Я показую картину й варіанти." },
  { icon: Lightbulb, title: "Заздалегідь", text: "«Більшість податкових проблем видно заздалегідь — просто нема кому подивитися вчасно.»" },
];

const stats = [
  { icon: FileText, v: "200+", l: "податкових накладних розблоковано" },
  { icon: Banknote, v: "16+ млн", l: "грн ПДВ відшкодовано клієнтам" },
  { icon: ShieldCheck, v: "10+", l: "компаній виведено з ризикових" },
  { icon: BookOpen, v: "десятки", l: "повних аудитів бізнесу" },
];

export default function ProKarynu() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#e3e3e4]">
        <Header current="/pro-karynu/" />
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 pb-16 pt-10 md:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:pb-20 lg:pt-14">
          <div className="animate-rise">
            <Eyebrow icon={UserRound}>Про Карину</Eyebrow>
            <h1 className="mt-5 text-[38px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[48px] lg:text-[58px]">
              Карина Замкова — <span className="mk">друга пара очей</span> для власника
            </h1>
            <p className="mt-5 max-w-[480px] text-[18px] leading-[1.5] text-text/80">Податковий консультант, 15 років в обліку, юридична освіта.</p>
            <div className="mt-8"><Cta /></div>
          </div>
          <div className="relative isolate mx-auto w-full max-w-[420px]">
            <div className="absolute -right-3 -top-4 -z-10 size-[70%] rounded-full bg-teal" aria-hidden />
            <img src="/images/karina.webp" alt="Карина Замкова" className="aspect-square w-full rounded-[var(--radius-media)] object-cover" fetchPriority="high" />
            <div className="absolute -bottom-5 left-4 flex items-center gap-1 text-ink">
              <span className="font-hand text-[26px]">«Я теж власниця бізнесу»</span>
              <ArrowSwoop className="h-8 w-14 -rotate-[30deg]" />
            </div>
          </div>
        </div>
      </section>
      <main>
        <Section>
          <Eyebrow icon={Sparkles}>Шлях</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Від бухгалтера <span className="mk">до консультанта</span>
          </h2>
          <ol className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {path.map(({ icon, year, text }) => (
              <li key={year} className="rounded-[var(--radius-card)] border border-line bg-white p-6">
                <IconTile icon={icon} />
                <p className="mt-5 text-3xl font-extrabold tabular-nums text-ink">{year}</p>
                <p className="mt-2 text-[16px] leading-relaxed text-text/75">{text}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section className="bg-ink text-white">
          <Eyebrow dark icon={Quote}>Як я працюю</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] !text-white md:text-[44px]">
            Чотири принципи <span className="text-teal">своїми словами</span>
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {principles.map(({ icon, title, text }) => (
              <article key={title} className="flex gap-5 rounded-[var(--radius-card)] border border-white/10 bg-ink-2 p-6">
                <IconTile icon={icon} tone="teal" />
                <div>
                  <h3 className="text-xl font-bold !text-white">{title}</h3>
                  <p className="mt-2 text-[16.5px] leading-relaxed text-white/75">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section className="bg-paper">
          <Eyebrow icon={ShieldCheck}>Практика</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Результати <span className="mk">для клієнтів</span>
          </h2>
          <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ icon: Icon, v, l }) => (
              <div key={l} className="rounded-[var(--radius-card)] border border-line bg-white p-6">
                <Icon className="size-6 text-teal-deep" aria-hidden />
                <dd className="mt-4 text-4xl font-extrabold tabular-nums text-ink">{v}</dd>
                <dt className="mt-1 text-sm text-muted">{l}</dt>
              </div>
            ))}
          </dl>
        </Section>

        <Reviews />
        <FinalCta
          title={
            <>
              Подивимось на ваш бізнес <span className="text-teal">разом</span>
            </>
          }
          image="/images/hero-desk-1280.webp"
        />
      </main>
      <Footer />
    </>
  );
}
