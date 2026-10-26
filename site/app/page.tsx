import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Clock3,
  FileCheck2,
  Landmark,
  ListChecks,
  Lock,
  Percent,
  PiggyBank,
  Scale,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import PageHero from "./components/PageHero";
import { About, FinalCta, Footer, Reviews } from "./components/Sections";
import { Cta, Eyebrow, IconTile, Section } from "./components/ui";

const directions = [
  {
    icon: ScanSearch,
    tag: "Перевірки",
    title: "Перевірки й аудит для власника",
    text: "Незалежний погляд на ваші рахунки, облік і структуру — до того, як це побачить банк чи податкова.",
    links: [
      { href: "/ochyma-banku/", icon: Landmark, label: "Експрес-перевірка «Очима банку»", meta: "4 000 грн · 3 робочі дні" },
      { href: "/audyt/", icon: ShieldCheck, label: "Аудит фінансової безпеки", meta: "від 20 000 грн · 4 площини" },
    ],
    dark: true,
  },
  {
    icon: Briefcase,
    tag: "Супровід",
    title: "Бухгалтерія та юридичний супровід",
    text: "Облік, звітність, податки й зарплата щомісяця. Для ФОП 2–3 групи і ТОВ.",
    links: [
      { href: "/suprovid/", icon: Wallet, label: "Супровід ФОП", meta: "від 1 200 грн/міс" },
      { href: "/suprovid/#tov", icon: Building2, label: "Супровід ТОВ", meta: "від 9 000 грн/міс" },
    ],
  },
];

const benefits = [
  { icon: ShieldCheck, title: "Без ризиків", text: "Звітність вчасно — незалежно від відпустки чи настрою бухгалтера." },
  { icon: PiggyBank, title: "Дешевше за штат", text: "Не треба утримувати бухгалтера, юриста, кадровика." },
  { icon: Percent, title: "Оптимальні податки", text: "Підберемо систему оподаткування під вашу діяльність." },
  { icon: Scale, title: "Юридична підтримка", text: "Договори, зміни в ЄДР, перевірка контрагентів." },
  { icon: Clock3, title: "Ваш час", text: "Плануємо звіти й платежі за вас і не турбуємо дрібницями." },
  { icon: Lock, title: "Безпека даних", text: "Документи зберігаються під захистом і не виходять назовні." },
];

export default function Home() {
  return (
    <>
      <PageHero
        current="/"
        eyebrow="Бухгалтерія та перевірки для ФОП і ТОВ"
        eyebrowIcon={Sparkles}
        title={
          <>
            Ви розвиваєте бізнес — <span className="mk">ми його супроводжуємо</span>
          </>
        }
        lede="Облік, податки і незалежна перевірка ризиків — онлайн по всій Україні."
        image="/images/page-home.webp"
        imageAlt="Мініатюрні бухгалтери складають звітність у папки і перевіряють стос документів лупою"
        chips={[
          { icon: FileCheck2, label: "з 2019 року" },
          { icon: UserRound, label: "15 років в обліку" },
          { icon: ListChecks, label: "ФОП · ТОВ · ОСББ" },
        ]}
        cta={<Cta href="#napriamky">Обрати послугу</Cta>}
        secondary={
          <a href="/anketa/" className="inline-flex items-center gap-2 text-[16px] font-semibold text-teal-deep underline decoration-teal decoration-2 underline-offset-4 hover:text-ink">
            Анкета на перевірку
          </a>
        }
        note="усе під контролем"
      />
      <main>
        <Section id="napriamky">
          <Eyebrow icon={Briefcase}>Два напрями</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Що <span className="mk">ми робимо</span>
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {directions.map((d) => (
              <article key={d.title} className={`flex flex-col rounded-[28px] p-7 md:p-9 ${d.dark ? "bg-ink text-white" : "border border-line bg-paper"}`}>
                <div className="flex items-center justify-between">
                  <IconTile icon={d.icon} tone={d.dark ? "teal" : "ink"} size="lg" />
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${d.dark ? "bg-white/10 text-teal-light" : "bg-white text-teal-deep"}`}>{d.tag}</span>
                </div>
                <h3 className={`mt-6 text-2xl font-extrabold md:text-[28px] ${d.dark ? "!text-white" : ""}`}>{d.title}</h3>
                <p className={`mt-3 max-w-[460px] text-[16px] leading-relaxed ${d.dark ? "text-white/70" : "text-text/75"}`}>{d.text}</p>
                <ul className="mt-8 grid gap-3">
                  {d.links.map(({ href, icon: Icon, label, meta }) => (
                    <li key={href}>
                      <a
                        href={href}
                        className={`group flex items-center gap-4 rounded-2xl p-4 transition-colors ${d.dark ? "bg-white/[0.06] hover:bg-white/[0.1]" : "bg-white hover:bg-tint"}`}
                      >
                        <Icon className={`size-6 shrink-0 ${d.dark ? "text-teal" : "text-teal-deep"}`} aria-hidden />
                        <span className="flex-1">
                          <span className="block font-bold">{label}</span>
                          <span className={`text-sm ${d.dark ? "text-white/55" : "text-muted"}`}>{meta}</span>
                        </span>
                        <span className={`grid size-9 place-items-center rounded-full transition-transform group-hover:rotate-12 ${d.dark ? "bg-teal text-ink" : "bg-ink text-teal"}`}>
                          <ArrowUpRight className="size-4" aria-hidden />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        <Section className="bg-paper">
          <Eyebrow icon={ShieldCheck}>Що ви отримуєте</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Рішення <span className="mk">для кожного власника</span>
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-[var(--radius-card)] border border-line bg-white p-6">
                <IconTile icon={icon} />
                <div>
                  <p className="text-lg font-bold text-ink">{title}</p>
                  <p className="mt-1 text-[16px] leading-relaxed text-text/75">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <About />
        <Reviews />
        <FinalCta
          title={
            <>
              Не знаєте, з чого почати? <span className="text-teal">Заповніть анкету</span>
            </>
          }
          image="/images/page-home.webp"
        />
      </main>
      <Footer />
    </>
  );
}
