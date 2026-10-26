import type { Metadata } from "next";
import {
  BadgeCheck,
  Banknote,
  BookOpen,
  Building2,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  FileSearch,
  FileText,
  HeartHandshake,
  Landmark,
  Layers,
  ListChecks,
  Map,
  MessagesSquare,
  Network,
  Phone,
  Receipt,
  ScanSearch,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import PageHero from "../components/PageHero";
import { AUDIT_PRICE, CASES, Faq, FinalCta, Footer } from "../components/Sections";
import { Eyebrow, IconTile, Section } from "../components/ui";

export const metadata: Metadata = {
  title: "Аудит фінансової безпеки · Outsistent",
  description: "Незалежна перевірка обліку для власника бізнесу: структура, облік, податки, банки. Карта ризиків і план дій.",
};

const situations = [
  { icon: Users, title: "Кілька ФОПів", text: "Бізнес виріс, з'явилось кілька ФОПів, партнер чи родич у структурі — і ви хочете зрозуміти, наскільки безпечно побудована сама модель." },
  { icon: Building2, title: "ТОВ на одному бухгалтері", text: "Облік ведеться, звітність здається — але роками все тримається на одній людині, і незалежного погляду давно не було." },
  { icon: Layers, title: "Структура ускладнилась", text: "З'явились нові напрямки, ПДВ, ЗЕД чи інші податкові нюанси — і ви хочете зрозуміти, чи все побудовано коректно." },
];

const zones = [
  { icon: Network, title: "Структура бізнесу та податкова модель", text: "Чи відповідає структура реальній діяльності, чи немає ознак дроблення." },
  { icon: BookOpen, title: "Облік і звітність", text: "Чи все відображено коректно і вчасно, чи немає прихованих розбіжностей." },
  { icon: Receipt, title: "Податки та податкові ризики", text: "Де накопичуються зобов'язання, які можуть спливти при перевірці." },
  { icon: Landmark, title: "Банки та фінансовий моніторинг", text: "Чи рух коштів не викликає запитань у банку чи контролюючих органів." },
];

const results = [
  { icon: Map, title: "Карта ризиків", text: "Усе знайдене за пріоритетом: критично / важливо / допустимо." },
  { icon: ListChecks, title: "План дій", text: "Що виправити зараз, що далі, що просто контролювати." },
  { icon: FileText, title: "Письмовий звіт", text: "Лишається у вас назавжди." },
  { icon: Video, title: "Стратегічна зустріч", text: "Проходимо всю карту разом." },
  { icon: CalendarDays, title: "14 днів на уточнення", text: "Після завершення аудиту." },
];

const steps = [
  { icon: ClipboardList, title: "Анкета", text: "Коротка анкета про бізнес, облік і податкову ситуацію." },
  { icon: Phone, title: "Коротка розмова", text: "Уточнюємо деталі, формат і вартість під ваш випадок." },
  { icon: ScanSearch, title: "Аудит", text: "Структура, облік, податки, банки й фінмоніторинг." },
  { icon: FileSearch, title: "Висновки", text: "Структурований результат з пріоритетами." },
  { icon: MessagesSquare, title: "Фінальний розбір", text: "Що виправити першочергово — разом." },
];

const faq: [typeof Banknote, string, string][] = [
  [Banknote, "«Це дорого»", "Ціна ризику — штраф і донарахування — у рази більша за вартість аудиту. Аудит окупається одним попередженим порушенням."],
  [HeartHandshake, "«Боюсь дізнатись, що там погано»", "Аудит — не вирок. Це м'яка подача з конкретним планом дій: що критично, що можна залишити без змін і що робити далі."],
  [UserRound, "«Бухгалтер каже, що все ок»", "Я не оцінюю бухгалтера як людину і не шукаю помилки заради помилок. Це друга, незалежна пара очей — додаткова точка контролю для власника."],
  [Store, "«У мене невеликий ФОП»", "Навіть якщо до ліміту ще далеко, помилки трапляються там, де їх не очікують: у ПРРО, оплатах, оформленні документів."],
  [Landmark, "«З податкової немає запитів — отже, все ок»", "Відсутність запиту не означає відсутність ризику. Найчастіше проблеми накопичуються непомітно роками."],
  [CircleHelp, "Кому аудит не підійде?", "Якщо потрібна консультація лише з одного питання або допомога з окремою задачею. Для цього є консультація — 1 500 грн за 30 хвилин."],
];

export default function Audyt() {
  return (
    <>
      <PageHero
        current="/audyt/"
        eyebrow="Аудит фінансової безпеки"
        eyebrowIcon={ShieldCheck}
        title={
          <>
            Незалежна перевірка <span className="mk">для власника</span>
          </>
        }
        lede="Що під контролем, де ризики і що робити далі — до того, як це побачить податкова."
        image="/images/page-audit.webp"
        imageAlt="Мініатюрні аудитори перевіряють чотири стоси документів: структура, облік, податки, банки"
        chips={[
          { icon: Layers, label: "4 площини" },
          { icon: Map, label: "карта ризиків" },
          { icon: Banknote, label: AUDIT_PRICE },
        ]}
        note="чотири площини — одна картина"
      />
      <main>
        <Section>
          <Eyebrow icon={Users}>Кому підійде</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Три ситуації, з якими <span className="mk">приходять на аудит</span>
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {situations.map(({ icon, title, text }) => (
              <article key={title} className="rounded-[var(--radius-card)] border border-line bg-white p-6">
                <IconTile icon={icon} />
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-text/75">{text}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section className="bg-ink text-white">
          <Eyebrow dark icon={ScanSearch}>Що я перевіряю</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] !text-white md:text-[44px]">
            Чотири площини, у яких <span className="text-teal">ховається ризик</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {zones.map(({ icon, title, text }, i) => (
              <article key={title} className="rounded-[var(--radius-card)] border border-white/10 bg-ink-2 p-6">
                <div className="flex items-center justify-between">
                  <IconTile icon={icon} tone="teal" />
                  <span className="text-4xl font-extrabold tabular-nums text-white/15">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold !text-white">{title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-white/70">{text}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div>
              <Eyebrow icon={BadgeCheck}>Що ви отримаєте</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
                Результат, який <span className="mk">лишається у вас</span>
              </h2>
              <figure className="mt-8 overflow-hidden rounded-[var(--radius-media)]">
                <img src="/images/risk-map.webp" alt="Мініатюрні бухгалтери розставляють кольорові позначки на карті ризиків" className="aspect-[4/3] w-full object-cover" loading="lazy" />
              </figure>
            </div>
            <ul className="grid content-center gap-3">
              {results.map(({ icon, title, text }) => (
                <li key={title} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5">
                  <IconTile icon={icon} />
                  <div>
                    <p className="text-lg font-bold text-ink">{title}</p>
                    <p className="text-[16px] text-text/75">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section className="bg-paper">
          <Eyebrow icon={ClipboardList}>Як проходить аудит</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            П&apos;ять кроків <span className="mk">від анкети до плану дій</span>
          </h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map(({ icon, title, text }, i) => (
              <li key={title} className="relative rounded-[var(--radius-card)] border border-line bg-white p-5">
                <span className="absolute right-4 top-4 text-sm font-bold tabular-nums text-muted">0{i + 1}</span>
                <IconTile icon={icon} tone={i === 0 ? "teal" : "tint"} />
                <p className="mt-5 text-lg font-bold text-ink">{title}</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-text/75">{text}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section>
          <Eyebrow icon={FileSearch}>Реальні кейси</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Що знаходить аудит, коли <span className="mk">власник упевнений</span>
          </h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {CASES.map((c) => (
              <figure key={c.tag} className="flex flex-col rounded-[var(--radius-card)] border border-line bg-paper p-6">
                <IconTile icon={c.icon} tone="white" size="sm" />
                <blockquote className="mt-5 text-[16px] leading-relaxed text-text/85">{c.text}</blockquote>
                <figcaption className="mt-auto pt-6">
                  <span className="inline-flex rounded-full bg-tint px-3 py-1 text-xs font-bold text-teal-deep">{c.tag}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Faq items={faq} title={<>Чесні відповіді <span className="mk">на сумніви</span></>} />
        <FinalCta
          title={
            <>
              Не впевнені, чи потрібен <span className="text-teal">повний аудит?</span>
            </>
          }
          image="/images/page-audit.webp"
        />
      </main>
      <Footer />
    </>
  );
}
