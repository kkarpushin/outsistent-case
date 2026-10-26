import {
  AlarmClock,
  BadgeCheck,
  Banknote,
  BookOpenCheck,
  Calculator,
  CalendarSync,
  CircleCheck,
  HandCoins,
  History,
  Info,
  ListTodo,
  Lock,
  LockOpen,
  Map as MapIcon,
  MessageSquareText,
  ReceiptText,
  ScanEye,
  ShieldQuestionMark,
  Split,
  Tag,
  Building2,
  CalendarClock,
  Check,
  CircleHelp,
  ClipboardList,
  CreditCard,
  FileSearch,
  FileStack,
  FileText,
  Gauge,
  Handshake,
  HeartHandshake,
  Landmark,
  ListChecks,
  Mail,
  MapPin,
  MessageCircleQuestion,
  MessagesSquare,
  Minus,
  Phone,
  Plus,
  Quote,
  Route,
  ScanSearch,
  Scale,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Video,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowCurlDown,
  ArrowSwoop,
  Cta,
  EMAIL,
  Eyebrow,
  IconTile,
  INSTAGRAM_DM,
  PHONE,
  PHONE_2,
  PHONE_HREF,
  REPLY_TIME,
  SITE_LINKS,
  Section,
  TELEGRAM,
} from "./ui";

export const EXPRESS_PRICE = "4 000 грн";
export const AUDIT_PRICE = "від 20 000 грн";

/* 3 · What the bank sees (dark, bank's point of view) */
export function BankSees() {
  const group = [
    { icon: MapPin, text: "Спільна адреса" },
    { icon: Store, text: "Одна точка продажу чи сайт" },
    { icon: Calculator, text: "Спільний бухгалтер" },
    { icon: CreditCard, text: "Один POS-термінал" },
  ];
  const statement = [
    { icon: TrendingUp, text: "Різке зростання оборотів" },
    { icon: Wallet, text: "Надходження на особисту картку паралельно з ФОП" },
    { icon: ReceiptText, text: "Призначення платежу не за КВЕДом" },
  ];
  return (
    <Section id="shcho-bachyt-bank" className="bg-ink text-white">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Eyebrow dark icon={Landmark}>Що бачить банк</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] !text-white md:text-[44px]">
            Банк не питає «чи законно». Він питає <span className="text-teal">«чи схоже на один бізнес»</span>
          </h2>
          <div className="mt-6 max-w-[540px] space-y-4 text-[17px] leading-relaxed text-white/75">
            <p>Банки дивляться не на кожен ФОП окремо. Окрема увага — групам пов&apos;язаних осіб, коли кілька ФОП де-факто є одним бізнесом.</p>
            <p className="font-semibold text-white">
              Це не привід для тривоги. Це привід подивитися на свої рахунки так само, як на них дивиться банк.
            </p>
          </div>
        </div>
        <figure className="overflow-hidden rounded-[var(--radius-media)] bg-[#e3e3e4]">
          <img
            src="/images/bank-sees.webp"
            alt="Мініатюрні інспектори банку з лупою простежують, як нитка з’єднує три ФОП з однією випискою з рахунку"
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
          />
        </figure>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04] p-6">
          <p className="flex items-center gap-3 text-lg font-bold text-white">
            <IconTile icon={Users} tone="dark" size="sm" /> Ознаки групи пов&apos;язаних осіб
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {group.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-4 py-3 text-[16px] font-semibold">
                <Icon className="size-5 shrink-0 text-teal" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04] p-6">
          <p className="flex items-center gap-3 text-lg font-bold text-white">
            <IconTile icon={ReceiptText} tone="dark" size="sm" /> Що насторожує у виписці
          </p>
          <ul className="mt-5 grid gap-3">
            {statement.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-4 py-3 text-[16px] font-semibold">
                <Icon className="size-5 shrink-0 text-teal" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-6 text-xs text-white/45">За матеріалами банків і фахових видань, 2026.</p>
    </Section>
  );
}

/* 4 · Why now */
export function WhyNow() {
  const items: { icon: LucideIcon; date: string; text: string }[] = [
    { icon: Handshake, date: "14 травня 2026", text: "Банки за Меморандумом обмінюються інформацією про клієнтів з ознаками підозрілості." },
    { icon: Gauge, date: "14 листопада 2026", text: "Нові (до 6 місяців) і «сплячі» ФОП 2–3 групи без підтвердження доходів — до 1 млн грн на місяць." },
    { icon: Split, date: "З початку 2026", text: "ДПС виявила понад 500 брендів з ознаками дроблення." },
    { icon: FileStack, date: "Один запит банку", text: "Це десятки документів. У практиці трапляються запити на понад 90." },
  ];
  return (
    <Section id="chomu-zaraz">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">Що змінилось у 2026 році</h2>
        </div>
        <p className="max-w-[360px] text-[16px] leading-relaxed text-muted">Без паніки. Просто дати, які варто знати власнику кількох ФОП.</p>
      </div>
      <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon, date, text }) => (
          <li key={date} className="flex flex-col border-t-2 border-ink pt-5">
            <p className="flex items-center gap-2.5 text-[22px] font-extrabold leading-tight text-ink">
              <IconTile icon={icon} size="sm" />
              {date}
            </p>
            <p className="mt-3 text-[16.5px] leading-relaxed text-text/85">{text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* 5 · Fit / not fit */
export function Fit() {
  const yes = [
    { icon: Users, b: "Кілька ФОП на одну справу.", t: "Ваші, чоловіка чи дружини, батьків — і всі працюють на один магазин, склад чи сайт." },
    { icon: Store, b: "Торгівля з ПРРО, маркетплейси, імпорт.", t: "Гроші приходять з різних каналів: NovaPay, еквайринг, накладений платіж." },
    { icon: TrendingUp, b: "Бізнес росте.", t: "Оборот іде до ліміту, а структура лишилась тією, з якої ви починали." },
  ];
  const no = [
    { icon: UserRound, t: "Один ФОП без росту. Чесно скажу: перевірка вам, швидше за все, не потрібна." },
    { icon: MessageCircleQuestion, t: "Потрібна відповідь на одне питання. Для цього є консультація — 1 500 грн за 30 хвилин." },
  ];
  return (
    <Section id="komu" className="bg-paper">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 md:p-9">
          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[40px]">Кому підійде перевірка</h2>
          <ul className="mt-8 space-y-5">
            {yes.map(({ icon, b, t }) => (
              <li key={b} className="flex gap-4">
                <IconTile icon={icon} tone="teal" size="sm" />
                <p className="text-[16.5px] leading-relaxed text-text/85">
                  <b className="font-bold text-ink">{b}</b> {t}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col rounded-[var(--radius-card)] bg-white/60 p-6 md:p-9">
          <h3 className="text-[22px] font-bold text-ink">Кому не підійде</h3>
          <ul className="mt-6 space-y-5">
            {no.map(({ icon, t }) => (
              <li key={t} className="flex gap-4">
                <IconTile icon={icon} tone="white" size="sm" />
                <p className="text-[16.5px] leading-relaxed text-text/75">{t}</p>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center gap-2 pt-8 text-ink">
            <HeartHandshake className="size-5 text-teal-deep" aria-hidden />
            <span className="font-hand text-2xl">чесність — теж сервіс</span>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* 6 · Deliverables */
export function Deliverables() {
  const items = [
    { icon: MapIcon, b: "Карта ризиків рахунків і структури", t: "що банк може побачити як проблему, по кожному ФОП: критично, важливо, допустимо." },
    { icon: FileStack, b: "Список документів,", t: "які варто мати під рукою до запиту банку." },
    { icon: MessageSquareText, b: "Як коротко описати модель бізнесу", t: "для банку, щоб опис збігався з тим, що видно у виписці." },
    { icon: ListChecks, b: "План дій:", t: "що виправити зараз, що — пізніше, що можна залишити." },
    { icon: Video, b: "Розбір онлайн", t: "— 30–40 хвилин, відповіді на ваші питання." },
  ];
  const sample = [
    { level: "критично", dot: "bg-risk-critical", text: "Оплати покупців на особисту картку паралельно з ФОП" },
    { level: "важливо", dot: "bg-risk-important", text: "Призначення платежу не збігається з КВЕДами" },
    { level: "важливо", dot: "bg-risk-important", text: "Спільний POS-термінал для двох ФОП" },
    { level: "допустимо", dot: "bg-teal", text: "Залишки на рахунку на кінець дня" },
  ];
  return (
    <Section id="shcho-otrymaiete">
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">Після перевірки у вас на руках</h2>
          <ul className="mt-8 divide-y divide-line">
            {items.map(({ icon, b, t }) => (
              <li key={b} className="flex items-start gap-4 py-4">
                <IconTile icon={icon} size="sm" />
                <p className="pt-1.5 text-[17px] leading-relaxed text-text/85">
                  <b className="font-bold text-ink">{b}</b> {t}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex items-start gap-2 text-sm leading-relaxed text-muted">
            <Scale className="mt-0.5 size-4 shrink-0" aria-hidden />
            Це перевірка податкових і банківських ризиків, а не аудит фінансової звітності у розумінні Закону № 2258-VIII.
          </p>
        </div>

        <div className="relative">
          <figure className="overflow-hidden rounded-[var(--radius-media)] bg-[#e3e3e4]">
            <img src="/images/risk-map.webp" alt="Мініатюрні бухгалтери розставляють кольорові позначки на карті ризиків" className="aspect-[4/3] w-full object-cover" loading="lazy" />
          </figure>
          <div className="relative -mt-16 ml-4 mr-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[0_24px_50px_-28px_rgba(17,20,27,0.45)] md:-mt-24 md:ml-10 md:mr-0">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                <MapIcon className="size-4 text-teal-deep" aria-hidden /> Карта ризиків · ФОП 1 з 3
              </p>
              <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-muted">приклад</span>
            </div>
            <ul className="mt-4 space-y-2.5">
              {sample.map((s) => (
                <li key={s.text} className="flex items-start gap-3 text-[14px] leading-snug">
                  <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${s.dot}`} />
                  <span className="flex-1 text-text/85">{s.text}</span>
                  <span className="shrink-0 text-xs font-semibold text-muted">{s.level}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute -top-10 right-2 hidden items-end gap-1 text-ink md:flex">
            <span className="font-hand text-2xl">так виглядає результат</span>
            <ArrowCurlDown className="h-12 w-16" />
          </div>
        </div>
      </div>
    </Section>
  );
}

/* 7 · How it works */
export function Process() {
  const steps = [
    { icon: ClipboardList, b: "Анкета", t: "5–7 хвилин: форма бізнесу, скільки ФОП, оборот, хто веде облік." },
    { icon: FileStack, b: "Документи", t: "Виписки по всіх рахунках за останні 12 місяців, КВЕДи, ключові договори." },
    { icon: ScanEye, b: "Перевірка", t: "3 робочі дні." },
    { icon: Video, b: "Розбір", t: "Онлайн-зустріч і письмова карта ризиків." },
  ];
  return (
    <Section id="yak-tse-pratsiuie" className="bg-ink text-white">
      <Eyebrow dark icon={Route}>Як це працює</Eyebrow>
      <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] !text-white md:text-[44px]">
        Чотири кроки, <span className="text-teal">3 робочі дні</span>
      </h2>
      <div className="relative mt-12">
        <svg className="pointer-events-none absolute inset-x-0 top-9 hidden h-24 w-full lg:block" viewBox="0 0 1200 100" preserveAspectRatio="none" fill="none" aria-hidden>
          <path d="M60 60 C 220 0, 360 100, 520 50 S 820 0, 960 50 S 1120 90, 1160 40" stroke="#30D5C8" strokeOpacity=".55" strokeWidth="2.5" strokeDasharray="7 9" strokeLinecap="round" />
        </svg>
        <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, b, t }, i) => (
            <li key={b} className="rounded-[var(--radius-card)] border border-white/10 bg-ink-2 p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-full bg-teal text-ink">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="text-4xl font-extrabold tabular-nums text-white/15">0{i + 1}</span>
              </div>
              <p className="mt-6 text-xl font-bold">{b}</p>
              <p className="mt-2 text-[16px] leading-relaxed text-white/70">{t}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Cta />
        <span className="flex items-center gap-2 text-sm text-white/55">
          <AlarmClock className="size-4" aria-hidden /> Відповідь {REPLY_TIME}
        </span>
      </div>
    </Section>
  );
}

/* 8 · Prices */
export function Pricing() {
  const tiers = [
    { icon: ListTodo, step: "Крок 1", title: "Чек-лист «10 ознак»", text: "Самоперевірка за 10 хвилин.", price: "Безкоштовно", sub: "за словом БАНК у директ" },
    { icon: ScanEye, step: "Крок 2", title: "Експрес-перевірка «Очима банку»", text: "Карта ризиків рахунків і структури ФОП, розбір онлайн.", price: EXPRESS_PRICE, sub: "зараховується в повний аудит", hot: true },
    { icon: ShieldCheck, step: "Крок 3", title: "Аудит фінансової безпеки", text: "4 площини: структура, облік, податки, банки. Карта ризиків, план дій, письмовий звіт, 14 днів на уточнення.", price: AUDIT_PRICE, sub: "залежить від структури бізнесу", href: "/audyt/" },
    { icon: CalendarSync, step: "Далі", title: "Супровід", text: "Облік і звітність щомісяця.", price: "ФОП від 1 200 грн/міс", sub: "ТОВ від 9 000 грн/міс", href: "/suprovid/" },
  ];
  return (
    <Section id="tsiny" className="bg-paper">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow icon={Tag}>Ціни</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Від самоперевірки до повного аудиту
          </h2>
        </div>
        <p className="flex max-w-[340px] items-start gap-2 text-[16px] leading-relaxed text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-teal-deep" aria-hidden />
          Вартість експрес-перевірки зараховується в повний аудит.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tiers.map((t) => (
          <article
            key={t.title}
            className={`relative flex flex-col rounded-[var(--radius-card)] p-6 ${t.hot ? "bg-ink text-white ring-2 ring-teal" : "border border-line bg-white"}`}
          >
            {t.hot && <span className="absolute -top-3 left-6 rounded-full bg-teal px-3 py-1 text-xs font-bold text-ink">Почніть звідси</span>}
            <div className="flex items-center justify-between">
              <IconTile icon={t.icon} tone={t.hot ? "teal" : "tint"} size="sm" />
              <span className={`text-sm font-semibold ${t.hot ? "text-white/60" : "text-muted"}`}>{t.step}</span>
            </div>
            <h3 className={`mt-4 text-xl font-bold ${t.hot ? "!text-white" : ""}`}>{t.title}</h3>
            <p className={`mt-2 text-[16px] leading-relaxed ${t.hot ? "text-white/75" : "text-text/75"}`}>{t.text}</p>
            <p className={`mt-auto pt-6 text-2xl font-extrabold ${t.hot ? "text-teal" : "text-ink"}`}>{t.price}</p>
            <p className={`mt-1 text-sm ${t.hot ? "text-white/60" : "text-muted"}`}>{t.sub}</p>
            {t.hot && (
              <div className="mt-5">
                <Cta className="!pl-5 !text-[14px]">Анкета</Cta>
              </div>
            )}
            {t.href && (
              <a href={t.href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-deep underline decoration-teal underline-offset-4">
                Детальніше
              </a>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}

/* 9 · About Karina */
export function About() {
  const stats = [
    { icon: LockOpen, v: "200+", l: "податкових накладних розблоковано" },
    { icon: HandCoins, v: "16+ млн", l: "грн ПДВ відшкодовано клієнтам" },
    { icon: ShieldCheck, v: "10+", l: "компаній виведено з ризикових" },
  ];
  return (
    <Section id="pro-mene">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="relative isolate mx-auto w-full max-w-[440px]">
          <div className="absolute -right-2 -top-4 -z-10 size-[72%] rounded-full bg-teal md:-right-5 md:-top-5" aria-hidden />
          <img src="/images/karina.webp" alt="Карина Замкова, податковий консультант" className="aspect-square w-full rounded-[var(--radius-media)] object-cover" loading="lazy" />
          <div className="absolute -bottom-6 -right-2 flex items-center gap-1 text-ink md:-right-10">
            <ArrowSwoop className="h-8 w-16 rotate-[160deg]" />
            <span className="font-hand text-[28px] leading-none">Карина</span>
          </div>
        </div>
        <div>
          <Eyebrow icon={UserRound}>Про мене</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            <span className="mk">Друга, незалежна</span> пара очей
          </h2>
          <div className="mt-6 max-w-[600px] space-y-4 text-[17px] leading-relaxed text-text/85">
            <p>Я Карина Замкова. 15 років в обліку, друга вища освіта — юридична. З 2019 року керую бухгалтерською компанією «Аутсістент».</p>
            <p>Бухгалтер веде облік. Моя робота — подивитися збоку і показати, що видно банку й податковій.</p>
          </div>
          <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map(({ icon: Icon, v, l }) => (
              <div key={l} className="rounded-2xl bg-paper p-4">
                <Icon className="size-5 text-teal-deep" aria-hidden />
                <dd className="mt-3 text-3xl font-extrabold text-ink tabular-nums">{v}</dd>
                <dt className="mt-1 text-sm leading-snug text-text/75">{l}</dt>
              </div>
            ))}
          </dl>
          <a href="/pro-karynu/" className="mt-6 inline-flex items-center gap-2 text-[16px] font-semibold text-teal-deep underline decoration-teal underline-offset-4">
            <UserRound className="size-4" aria-hidden /> Більше про Карину
          </a>
        </div>
      </div>
    </Section>
  );
}

/* 10 · Cases (verbatim from audit.outsistent.com.ua) */
export const CASES = [
  {
    icon: Users,
    tag: "Кілька ФОПів",
    text: "ТОВ-імпортер на загальній системі оподаткування серед покупців мав лише два ФОПи — чоловік і дружина. Уже на етапі кваліфікації, до початку перевірки обліку, стало видно ряд ознак: обидва ФОП торгували однаковими категоріями товару, мали одну юридичну адресу, один сервер і одну відповідальну особу в банку. По суті — розмежування лімітів між двома ФОПами одного бізнесу, а не два самостійні підприємства. Власнику були передані конкретні ризики та план дій — що потрібно змінити в структурі, щоб зняти ознаки дроблення до того, як це побачить податкова.",
  },
  {
    icon: Building2,
    tag: "ТОВ на одному бухгалтері",
    text: "Власник невеликого ТОВ з одним бухгалтером отримував фінансову допомогу — 4 млн грн, оформлені бухгалтером як дивіденди, але без утримання податку. Бухгалтер знала про проблему, але вважала ризик неактуальним: «поки не перевірять — може й не спіймають». Власник дізнався про це лише під час аудиту. Ми переоформили виплату як поворотну фінансову допомогу: кошти повернулись від засновника, після чого виплату можна провести як дивіденди — але вже коректно, з утриманням податку.",
  },
  {
    icon: Store,
    tag: "ФОП на спрощеній системі",
    text: "ФОП на спрощеній системі вів облік самостійно і звернувся на аудит просто щоб упевнитись, що все гаразд. Аудит виявив кілька порушень одразу: оплата приймалась сертифікатом як негрошовий розрахунок через ПРРО, була помилка в адресі торговельної точки, частину оплат власник приймав на особисту картку. Найкритичніше — прийом оплати сертифікатом: щойно податкова це виявить, статус платника єдиного податку анулюють автоматично. Ризики виявились настільки високими, що було ухвалено рішення тимчасово зупинити діяльність по цьому ФОП.",
  },
];

export function Cases() {
  return (
    <Section id="keisy" className="bg-paper">
      <h2 className="text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">Що знаходить перевірка: три ситуації з практики</h2>
      <p className="mt-3 text-[16px] text-muted">Узагальнено, без імен.</p>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {CASES.map((c) => (
          <figure key={c.tag} className="flex flex-col rounded-[var(--radius-card)] border border-line bg-white p-6">
            <figcaption className="flex items-center gap-3">
              <IconTile icon={c.icon} size="sm" />
              <span className="text-[17px] font-bold text-ink">{c.tag}</span>
            </figcaption>
            <p className="mt-4 text-[16px] leading-relaxed text-text/85">{c.text}</p>
          </figure>
        ))}
      </div>
    </Section>
  );
}

/* Reviews (Google Maps, ТОВ «Аутсістент», 5.0) */
export const REVIEWS = [
  { who: "Транспортна компанія", date: "серпень 2020", text: "Справжні професіонали, знавці своєї справи! Працюють швидко та чітко! Наша транспортна компанія тепер може спокійно працювати, блокування закінчилися… Ще раз дякуємо!" },
  { who: "ПП, оптовий продаж квітів", date: "травень 2020", text: "Як флорист я знаю свою роботу, але як бухгалтер я повний нуль. Я звернулася за рекомендацією знайомих до Аутсістент. Співпрацюємо вже 4 місяці і результатом дуже задоволена. Рекомендую, відповідальні!" },
  { who: "Клієнт на обслуговуванні", date: "травень 2020", text: "Повністю задоволена якістю бухгалтерського та податкового обліку, своєчасним складанням усіх звітностей, консультаціями та підтримкою. Однозначно рекомендую." },
  { who: "Клієнт на обслуговуванні", date: "березень 2020", text: "Працюємо з командою Аутсістент уже не перший рік. Ведуть нам регулярно бухгалтерію. Все професійно, рекомендую!" },
];

export function Reviews() {
  return (
    <Section id="vidguky">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">Що кажуть клієнти</h2>
        </div>
        <a
          href="https://www.google.com/maps/search/?api=1&query=%D0%A2%D0%9E%D0%92%20%C2%AB%D0%90%D1%83%D1%82%D1%81%D1%96%D1%81%D1%82%D0%B5%D0%BD%D1%82%C2%BB&query_place_id=ChIJg6WQU1Zn3EARKKsxAC3bo4Q"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 text-[16px] font-semibold text-ink underline decoration-teal underline-offset-4"
        >
          <span className="flex text-teal-deep" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </span>
          5.0 на Google Maps
        </a>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {REVIEWS.map((r) => (
          <figure key={r.text} className="rounded-[var(--radius-card)] bg-paper p-6">
            <div>
              <blockquote className="text-[17px] leading-relaxed text-text/90">«{r.text}»</blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-ink">
                {r.who} <span className="font-normal text-muted">· {r.date}, Google</span>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>
    </Section>
  );
}

/* 11 · FAQ */
export const LANDING_FAQ: [LucideIcon, string, string][] = [
  [Landmark, "Банк нічого не питав. Навіщо перевіряти?", "Відсутність запиту не означає відсутність ризику. Банки обмінюються даними, і те, що побачив один, бачать інші."],
  [Calculator, "Мій бухгалтер каже, що все гаразд.", "Я не перевіряю бухгалтера. Я дивлюся на ваші рахунки очима банку. Це друга, незалежна пара очей."],
  [HeartHandshake, "Боюсь дізнатись щось погане.", "Перевірка — не вирок. Ви отримаєте спокійний розбір і конкретний план: що виправити зараз, що потім."],
  [History, "Ми так працюємо вже 5 років.", "Банки ставлять запитання і ФОП з 20-річним досвідом. Минулі роки без запитів не гарантують наступних."],
  [Scale, "Кілька ФОП — це ж законна оптимізація?", "Я не сперечаюся про це. Я показую, що бачить банк, і пропоную структуру, до якої не буде питань."],
  [Tag, "Скільки це коштує?", `Експрес-перевірка — ${EXPRESS_PRICE}. Вартість зараховується в повний аудит.`],
  [ShieldQuestionMark, "Ви гарантуєте, що рахунок не заблокують?", "Ні. Цього не може гарантувати ніхто. Я покажу, що банк може побачити як ризик, і як підготуватися."],
];

export function Faq({ items = LANDING_FAQ, title }: { items?: [LucideIcon, string, string][]; title?: React.ReactNode }) {
  return (
    <Section id="pytannia">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <Eyebrow icon={CircleHelp}>Питання</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            {title ?? (
              <>
                Що зазвичай питають
              </>
            )}
          </h2>
          <p className="mt-4 max-w-[360px] text-[16px] leading-relaxed text-muted">Не знайшли свого питання — напишіть у Telegram, відповім {REPLY_TIME}.</p>
          <a href={TELEGRAM} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#039be5] px-5 py-3 text-[16px] font-bold text-white hover:bg-[#048acc]">
            <Send className="size-4" aria-hidden /> Telegram @outsistentZP
          </a>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {items.map(([Icon, q, a], i) => (
            <details key={q} className="group py-1" open={i === 0}>
              <summary className="flex cursor-pointer items-center gap-4 py-4 text-left text-[17px] font-bold text-ink">
                <Icon className="size-5 shrink-0 text-teal-deep" strokeWidth={1.75} aria-hidden />
                <span className="flex-1">{q}</span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-ink transition-colors group-open:border-teal group-open:bg-teal">
                  <Plus className="size-4 group-open:hidden" aria-hidden />
                  <Minus className="hidden size-4 group-open:block" aria-hidden />
                </span>
              </summary>
              <p className="pb-5 pl-9 pr-12 text-[17px] leading-relaxed text-text/85">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* 12 · Final call */
export function FinalCta({
  title,
  image = "/images/hero-desk-1280.webp",
  codeWord = "БАНК",
  gift = "надішлю чек-лист «10 ознак»",
}: {
  title?: React.ReactNode;
  image?: string;
  codeWord?: string;
  gift?: string;
}) {
  return (
    <section className="px-4 pb-16 md:px-8 md:pb-24">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[32px] bg-ink px-6 py-14 text-white md:px-14 md:py-20">
        <img src={image} alt="" className="absolute inset-y-0 right-0 hidden h-full w-[55%] object-cover object-[70%_center] opacity-35 md:block" aria-hidden />
        <div className="absolute inset-y-0 right-0 hidden w-[55%] bg-gradient-to-r from-ink to-transparent md:block" aria-hidden />
        <div className="relative max-w-[620px]">
          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] !text-white md:text-5xl">
            {title ?? (
              <>
                Подивіться на свої рахунки <span className="text-teal">до того, як це зробить банк</span>
              </>
            )}
          </h2>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[16px] text-white/75">
            <li className="flex items-center gap-2"><ClipboardList className="size-4 text-teal" aria-hidden />Анкета 5–7 хвилин</li>
            <li className="flex items-center gap-2"><BadgeCheck className="size-4 text-teal" aria-hidden />Без оплати та зобов&apos;язань</li>
            <li className="flex items-center gap-2"><AlarmClock className="size-4 text-teal" aria-hidden />Відповідь {REPLY_TIME}</li>
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Cta />
          </div>
          <p className="mt-6 text-[16px] leading-relaxed text-white/70">
            Або напишіть <b className="text-white">{codeWord}</b> у{" "}
            <a href={INSTAGRAM_DM} target="_blank" rel="noopener" className="font-semibold text-teal underline underline-offset-4">директ @karina_zamkova</a> чи в{" "}
            <a href={TELEGRAM} target="_blank" rel="noopener" className="font-semibold text-teal underline underline-offset-4">Telegram @outsistentZP</a> — {gift}.
          </p>
        </div>
      </div>
    </section>
  );
}

/* 13 · Footer */
export function Footer() {
  return (
    <footer className="bg-ink px-4 py-14 text-white/70 md:px-8">
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1.2fr_1fr_1.2fr]">
        <div>
          <a href="/"><img src="/images/logo-white.png" alt="Outsistent, аутсорсингова компанія" width={230} height={61} className="h-11 w-auto" /></a>
          <p className="mt-4 flex items-center gap-2 text-sm"><Building2 className="size-4 text-teal" aria-hidden />ТОВ «Аутсістент» · ЄДРПОУ 43052696</p>
          <p className="mt-2 flex items-start gap-2 text-sm"><MapPin className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />Запоріжжя, вул. Володимира Грищенка, 26А · працюємо онлайн по всій Україні</p>
        </div>
        <nav aria-label="Сторінки сайту">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {SITE_LINKS.map((l) => (
              <li key={l.href}><a href={l.href} className="hover:text-white">{l.label}</a></li>
            ))}
            <li><a href="/anketa/" className="font-semibold text-teal hover:text-white">Анкета</a></li>
          </ul>
        </nav>
        <div className="space-y-2.5 text-sm">
          <a href={PHONE_HREF} className="flex items-center gap-2 hover:text-white"><Phone className="size-4 text-teal" aria-hidden />{PHONE}</a>
          <p className="flex items-center gap-2"><Phone className="size-4 text-teal" aria-hidden />{PHONE_2}</p>
          <p className="flex items-center gap-2"><Mail className="size-4 text-teal" aria-hidden />{EMAIL}</p>
          <a href={TELEGRAM} target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-white"><Send className="size-4 text-teal" aria-hidden />Telegram @outsistentZP</a>
          <p className="flex items-center gap-2"><AlarmClock className="size-4 text-teal" aria-hidden />Відповідаємо {REPLY_TIME}</p>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1200px] flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-relaxed md:flex-row md:justify-between">
        <p className="flex items-start gap-2"><Scale className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden />Перевірки податкових і банківських ризиків не є аудитом фінансової звітності у розумінні Закону № 2258-VIII.</p>
        <a href="/pryvatnist/" className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-white"><Lock className="size-3.5 text-teal" aria-hidden />Політика конфіденційності</a>
      </div>
    </footer>
  );
}
