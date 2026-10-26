import type { Metadata } from "next";
import {
  BookMarked,
  CalendarSearch,
  ClipboardCheck,
  FileWarning,
  Gauge,
  Gift,
  AtSign,
  Landmark,
  ListChecks,
  Receipt,
  ReceiptText,
  ScanEye,
  Send,
  Split,
  Tags,
  Wallet,
} from "lucide-react";
import PageHero from "../components/PageHero";
import { FinalCta, Footer } from "../components/Sections";
import { Cta, Eyebrow, IconTile, INSTAGRAM_DM, Section } from "../components/ui";

export const metadata: Metadata = {
  title: "Самоперевірка ФОП · Outsistent",
  description: "Серія «Самоперевірка ФОП» Карини Замкової: КВЕДи, ліміт, податковий борг, ПРРО, документи, фінмоніторинг. Чек-листи за кодовим словом.",
};

const magnets = [
  { icon: Landmark, word: "БАНК", title: "Чек-лист «10 ознак»", text: "За якими банк бачить кілька ФОП як один бізнес." },
  { icon: ListChecks, word: "ЧЕК-ЛИСТ", title: "«19 помилок ФОП»", text: "Найчастіші помилки, які знаходимо під час перевірок." },
  { icon: Split, word: "МЕЖА", title: "Межа між структурою і ризиком", text: "Якщо у вашій структурі 2+ ФОП — з яких питань я починаю перевірку." },
];

const series = [
  { n: "1/7", icon: Tags, title: "КВЕДи", text: "КВЕДи налаштовують один раз при реєстрації — а бізнес тим часом змінюється.", url: "https://www.instagram.com/p/DctLkdoBQYw/" },
  { n: "2/7", icon: Gauge, title: "Ліміт ФОП", text: "Ліміт краще контролювати протягом року, а не побачити перевищення в грудні.", url: "https://www.instagram.com/p/DcwSoeBhndS/" },
  { n: "3/7", icon: Wallet, title: "Податковий борг", text: "Можна сплатити всі податки — і все одно мати борг: платіж не на той рахунок, недоплата, пеня.", url: "https://www.instagram.com/p/DcyjZHIhvaW/" },
  { n: "4/7", icon: Receipt, title: "Розрахунок сертифікатом", text: "Звичайна на перший погляд операція в чеку, яка для ФОП на ЄП може стати критичною.", url: "https://www.instagram.com/p/Dc1QQLzh-mo/" },
  { n: "5/7", icon: FileWarning, title: "Документи «на потім»", text: "Поки гроші спокійно заходять, здається, що з документами можна не поспішати.", url: "https://www.instagram.com/p/Dc29l-dgYSF/" },
  { n: "6/7", icon: Landmark, title: "Фінмоніторинг", text: "Чи буде банку зрозуміло, як реально працює ваш бізнес, якщо завтра почнеться фінмоніторинг?", url: "https://www.instagram.com/p/Dc_K1OphXIY/" },
];

const more = [
  { icon: CalendarSearch, title: "План перевірок на 2027 рік", text: "До 25 грудня ДПС оприлюднить план. Але відбір іде вже зараз.", url: "https://www.instagram.com/p/DezShPFooBL/" },
  { icon: ScanEye, title: "Податкова бачить ваші продажі", text: "Крім чеків ПРРО, дані надходять ще з п'яти джерел.", url: "https://www.instagram.com/p/De0iy5qFaRo/" },
  { icon: ReceiptText, title: "Річна звітність — не «просто декларація»", text: "Чек-лист самоаудиту ФОП: система, КВЕДи, звірка доходів, ліміт, документи.", url: "https://www.instagram.com/p/DUP4CE-k-LQ/" },
];

export default function Samoperevirka() {
  return (
    <>
      <PageHero
        current="/samoperevirka/"
        eyebrow="Самоперевірка ФОП"
        eyebrowIcon={ClipboardCheck}
        title={
          <>
            Перевірте себе <span className="mk">за 10 хвилин</span>
          </>
        }
        lede="Короткі розбори й чек-листи від Карини — те, що варто знати кожному ФОП."
        image="/images/page-samoperevirka.webp"
        imageAlt="Мініатюрні підприємці відмічають пункти великого чек-листа «Самоперевірка ФОП»"
        chips={[
          { icon: BookMarked, label: "серія з 7 частин" },
          { icon: Gift, label: "чек-листи безкоштовно" },
        ]}
        cta={<Cta href="#chek-lysty">Отримати чек-лист</Cta>}
        note="галочка за галочкою"
      />
      <main>
        <Section id="chek-lysty">
          <Eyebrow icon={Gift}>Безкоштовно</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Напишіть слово — <span className="mk">отримайте чек-лист</span>
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {magnets.map(({ icon, word, title, text }) => (
              <article key={word} className="flex flex-col rounded-[var(--radius-card)] border border-line bg-white p-6">
                <IconTile icon={icon} />
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-text/75">{text}</p>
                <a
                  href={INSTAGRAM_DM}
                  target="_blank"
                  rel="noopener"
                  className="mt-auto inline-flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 pt-3 font-bold text-white transition-colors hover:bg-ink-2 [margin-top:1.5rem]"
                >
                  <span className="flex items-center gap-2"><Send className="size-4 text-teal" aria-hidden />Напишіть у директ</span>
                  <span className="rounded-lg bg-teal px-2.5 py-1 text-sm text-ink">{word}</span>
                </a>
              </article>
            ))}
          </div>
        </Section>

        <Section className="bg-paper">
          <Eyebrow icon={BookMarked}>Серія «Самоперевірка ФОП»</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Шість речей, які <span className="mk">я перевіряю першими</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {series.map(({ n, icon, title, text, url }) => (
              <a key={n} href={url} target="_blank" rel="noopener" className="group flex flex-col rounded-[var(--radius-card)] border border-line bg-white p-6 transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(17,20,27,0.5)]">
                <div className="flex items-center justify-between">
                  <IconTile icon={icon} />
                  <span className="rounded-full bg-tint px-2.5 py-1 text-xs font-bold tabular-nums text-teal-deep">{n}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-text/75">{text}</p>
                <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-teal-deep">
                  <AtSign className="size-4" aria-hidden /> Дивитися в Instagram
                </span>
              </a>
            ))}
          </div>
        </Section>

        <Section>
          <Eyebrow icon={ScanEye}>Ще корисне</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Що <span className="mk">бачать банк і податкова</span>
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {more.map(({ icon, title, text, url }) => (
              <a key={url} href={url} target="_blank" rel="noopener" className="flex gap-4 rounded-[var(--radius-card)] border border-line bg-paper p-6 hover:bg-tint">
                <IconTile icon={icon} tone="white" size="sm" />
                <div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mt-1 text-[16px] leading-relaxed text-text/75">{text}</p>
                </div>
              </a>
            ))}
          </div>
        </Section>

        <FinalCta
          title={
            <>
              Знайшли у себе ризик? <span className="text-teal">Перевіримо разом</span>
            </>
          }
          image="/images/page-samoperevirka.webp"
        />
      </main>
      <Footer />
    </>
  );
}
