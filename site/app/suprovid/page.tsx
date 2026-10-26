import type { Metadata } from "next";
import {
  BadgeCheck,
  Banknote,
  BellRing,
  Briefcase,
  Building2,
  Calculator,
  CalendarCheck2,
  ClipboardCheck,
  CreditCard,
  FileSignature,
  FileText,
  Globe,
  Landmark,
  MessagesSquare,
  Package,
  Receipt,
  ScrollText,
  Send,
  ShieldCheck,
  Store,
  Truck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import PageHero from "../components/PageHero";
import { FinalCta, Footer } from "../components/Sections";
import { Cta, Eyebrow, IconTile, INSTAGRAM_DM, Section } from "../components/ui";

export const metadata: Metadata = {
  title: "Супровід ФОП і ТОВ · Outsistent",
  description: "Бухгалтерський супровід ФОП 2–3 групи від 1 200 грн/міс і ТОВ від 9 000 грн/міс. Податки, звітність, ПРРО, банк, консультації.",
};

const fopTiers = [
  { icon: Store, label: "Без РРО/ПРРО", g2: "1 200", g3: "1 500" },
  { icon: Receipt, label: "З РРО/ПРРО", g2: "1 900", g3: "2 200" },
  { icon: CreditCard, label: "+ еквайринг, термінали", g2: "2 500", g3: "3 000" },
  { icon: Truck, label: "+ накладений платіж", g2: "3 000", g3: "3 500" },
];

const tovTiers = [
  { icon: Building2, label: "ТОВ на ЄП, не платник ПДВ", price: "9 000" },
  { icon: Building2, label: "ТОВ на ЄП, платник ПДВ", price: "15 000" },
  { icon: Landmark, label: "ТОВ на загальній, не платник ПДВ", price: "15 000" },
  { icon: Landmark, label: "ТОВ на загальній, платник ПДВ", price: "20 000" },
];

const included = [
  { icon: Banknote, title: "Податки та звітність", text: "Планування й контроль оплати податків, декларація ФОП, звірка з податковою в е-кабінеті." },
  { icon: Calculator, title: "Облік діяльності", text: "Облік доходів і витрат, книга обліку, проведення документів — до 20 операцій на місяць." },
  { icon: Receipt, title: "Продажі та РРО", text: "Облік щоденних продажів, архів Z-звітів, моніторинг ПРРО раз на місяць." },
  { icon: Landmark, title: "Банк і платежі", text: "Платіжки по податках, контроль списань і зарахувань, звірка руху коштів з обліком." },
  { icon: MessagesSquare, title: "Консультації", text: "Відповіді на поточні питання, консультація з бухгалтером до 15 хв на місяць." },
  { icon: BellRing, title: "Контроль і спокій", text: "Строки звітності, нагадування про платежі, мінімізація податкових ризиків." },
];

const oneOff = [
  { icon: MessagesSquare, label: "Бухгалтерська консультація, до 30 хв", price: "від 1 500" },
  { icon: UserPlus, label: "Реєстрація ФОП через Дію", price: "2 500" },
  { icon: FileSignature, label: "Зміни в ЄДР (КВЕДи, дані)", price: "від 2 000" },
  { icon: FileText, label: "Закриття ФОП", price: "від 3 000" },
  { icon: ScrollText, label: "Перехід на єдиний податок", price: "1 500" },
  { icon: ClipboardCheck, label: "Декларація ФОП разово", price: "від 1 500" },
  { icon: Receipt, label: "Реєстрація ПРРО/РРО", price: "1 500" },
  { icon: Package, label: "Підбір і налаштування ПРРО", price: "2 500" },
  { icon: Users, label: "Зарплата, 1 працівник", price: "1 500/міс" },
  { icon: Wallet, label: "Підключення клієнт-банку", price: "1 000" },
];

export default function Suprovid() {
  return (
    <>
      <PageHero
        current="/suprovid/"
        eyebrow="Бухгалтерський супровід"
        eyebrowIcon={Briefcase}
        title={
          <>
            Облік і звітність — <span className="mk">без вашої участі</span>
          </>
        }
        lede="Для ФОП 2–3 групи і ТОВ. Ви ведете бізнес, ми — облік, податки й строки."
        image="/images/page-suprovid.webp"
        imageAlt="Мініатюрні бухгалтери відмічають дати звітності на великому календарі"
        chips={[
          { icon: Store, label: "ФОП від 1 200 грн/міс" },
          { icon: Building2, label: "ТОВ від 9 000 грн/міс" },
          { icon: CalendarCheck2, label: "строки під контролем" },
        ]}
        cta={<Cta href={INSTAGRAM_DM}>Підібрати тариф</Cta>}
        secondary={
          <span className="inline-flex items-center gap-2 text-[16px] font-semibold text-teal-deep">
            <Send className="size-4" aria-hidden /> або слово СУПРОВІД у директ
          </span>
        }
        note="звіти здано вчасно"
      />
      <main>
        <Section id="fop">
          <Eyebrow icon={Store}>Тарифи для ФОП</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Базовий тариф, <span className="mk">грн на місяць</span>
          </h2>
          <div className="mt-10 overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] bg-ink px-5 py-4 text-sm font-bold text-white md:px-7">
              <span>Формат роботи</span>
              <span className="text-right">ФОП 2 група</span>
              <span className="text-right">ФОП 3 група</span>
            </div>
            {fopTiers.map(({ icon: Icon, label, g2, g3 }) => (
              <div key={label} className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] items-center border-t border-line px-5 py-4 md:px-7">
                <span className="flex items-center gap-3 text-[16px] font-semibold text-ink">
                  <Icon className="size-5 shrink-0 text-teal-deep" aria-hidden />
                  {label}
                </span>
                <span className="text-right text-lg font-extrabold tabular-nums text-ink">від {g2}</span>
                <span className="text-right text-lg font-extrabold tabular-nums text-ink">від {g3}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">Базовий тариф — для стандартної діяльності ФОП. Більше операцій і додаткові послуги — окремо.</p>
        </Section>

        <Section className="bg-paper">
          <Eyebrow icon={BadgeCheck}>Що входить</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Базовий тариф — <span className="mk">це не «просто звіт»</span>
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {included.map(({ icon, title, text }) => (
              <li key={title} className="rounded-[var(--radius-card)] border border-line bg-white p-6">
                <IconTile icon={icon} />
                <p className="mt-5 text-lg font-bold text-ink">{title}</p>
                <p className="mt-1 text-[16px] leading-relaxed text-text/75">{text}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="tov" className="bg-ink text-white">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow dark icon={Building2}>Тарифи для ТОВ</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] !text-white md:text-[44px]">
                Повний облік ТОВ <span className="text-teal">без найманих працівників</span>
              </h2>
              <p className="mt-5 max-w-[480px] text-[16px] leading-relaxed text-white/70">
                Бух- і податковий облік, закриття місяця, ПДВ і податкові накладні, зарплата 1 працівника, уся звітність, консультації до 30 хв на місяць.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2 text-sm">
                <li className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-2"><Users className="size-4 text-teal" aria-hidden />Зарплата й кадри +1 500/міс</li>
                <li className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-2"><Globe className="size-4 text-teal" aria-hidden />ЗЕД +5 000/міс</li>
              </ul>
            </div>
            <ul className="grid content-center gap-3">
              {tovTiers.map(({ icon: Icon, label, price }) => (
                <li key={label} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-2 p-5">
                  <IconTile icon={Icon} tone="dark" size="sm" />
                  <span className="flex-1 text-[16px] font-semibold">{label}</span>
                  <span className="text-lg font-extrabold tabular-nums text-teal">від {price}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section>
          <Eyebrow icon={ShieldCheck}>Разові послуги</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Коли потрібне <span className="mk">одне конкретне</span>
          </h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {oneOff.map(({ icon: Icon, label, price }) => (
              <li key={label} className="flex items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4">
                <Icon className="size-5 shrink-0 text-teal-deep" aria-hidden />
                <span className="flex-1 text-[16px] font-semibold text-ink">{label}</span>
                <span className="text-[16px] font-extrabold tabular-nums text-ink">{price} грн</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">Остаточна вартість визначається після аналізу діяльності. Прайс 2026 року.</p>
        </Section>

        <FinalCta
          title={
            <>
              Розрахуємо вартість <span className="text-teal">під ваш бізнес</span>
            </>
          }
          image="/images/page-suprovid.webp"
          codeWord="СУПРОВІД"
          gift="підберемо формат і порахуємо вартість"
        />
      </main>
      <Footer />
    </>
  );
}
