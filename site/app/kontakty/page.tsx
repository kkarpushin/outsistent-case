import type { Metadata } from "next";
import { AlarmClock, AtSign, Building2, ClipboardList, Globe, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import PageHero from "../components/PageHero";
import { Footer } from "../components/Sections";
import { Cta, EMAIL, Eyebrow, IconTile, INSTAGRAM_DM, PHONE, PHONE_2, PHONE_HREF, REPLY_TIME, Section, TELEGRAM } from "../components/ui";

export const metadata: Metadata = {
  title: "Контакти · Outsistent",
  description: "Телефон, Telegram, Instagram і реквізити ТОВ «Аутсістент». Працюємо онлайн по всій Україні.",
};

const channels = [
  { icon: ClipboardList, title: "Анкета", value: "5–7 хвилин", href: "/anketa/", note: "найкращий старт: я одразу бачу вашу ситуацію" },
  { icon: Send, title: "Telegram", value: "@outsistentZP", href: TELEGRAM, note: "швидкі питання та документи" },
  { icon: AtSign, title: "Instagram", value: "@karina_zamkova", href: INSTAGRAM_DM, note: "кодові слова й чек-листи — тут" },
  { icon: Phone, title: "Телефон", value: PHONE, href: PHONE_HREF, note: `також ${PHONE_2}` },
  { icon: Mail, title: "Пошта", value: EMAIL, note: "для документів і офіційних листів" },
];

export default function Kontakty() {
  return (
    <>
      <PageHero
        current="/kontakty/"
        eyebrow="Контакти"
        eyebrowIcon={MessageCircle}
        title={
          <>
            Напишіть — <span className="mk">відповім {REPLY_TIME}</span>
          </>
        }
        lede="Працюємо онлайн по всій Україні. Оберіть зручний спосіб."
        image="/images/page-kontakty.webp"
        imageAlt="Мініатюрна бухгалтерка біля великого конверта і смартфона з анкетою"
        chips={[
          { icon: Globe, label: "онлайн по всій Україні" },
          { icon: AlarmClock, label: `відповідь ${REPLY_TIME}` },
        ]}
        note="на зв’язку"
      />
      <main>
        <Section>
          <Eyebrow icon={MessageCircle}>Як зв&apos;язатися</Eyebrow>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map(({ icon, title, value, href, note }) => {
              const inner = (
                <>
                  <IconTile icon={icon} tone={title === "Анкета" ? "teal" : "tint"} />
                  <p className="mt-5 text-sm font-semibold uppercase tracking-[0.08em] text-muted">{title}</p>
                  <p className="mt-1 break-words text-xl font-bold text-ink">{value}</p>
                  <p className="mt-2 text-[16px] text-text/70">{note}</p>
                </>
              );
              return href ? (
                <a key={title} href={href} {...(/^https?:/.test(href) ? { target: "_blank", rel: "noopener" } : {})} className="rounded-[var(--radius-card)] border border-line bg-white p-6 transition-colors hover:border-teal">
                  {inner}
                </a>
              ) : (
                <div key={title} className="rounded-[var(--radius-card)] border border-line bg-white p-6">{inner}</div>
              );
            })}
          </div>
        </Section>

        <Section className="bg-paper">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-6">
              <IconTile icon={Building2} />
              <p className="mt-5 text-lg font-bold text-ink">ТОВ «Аутсістент»</p>
              <dl className="mt-3 grid gap-1.5 text-[16px] text-text/80">
                <div className="flex gap-2"><dt className="text-muted">ЄДРПОУ:</dt><dd>43052696</dd></div>
                <div className="flex gap-2"><dt className="text-muted">Платник ПДВ:</dt><dd>так</dd></div>
                <div className="flex gap-2"><dt className="text-muted">Керівник:</dt><dd>Карина Замкова</dd></div>
              </dl>
            </div>
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-6">
              <IconTile icon={MapPin} />
              <p className="mt-5 text-lg font-bold text-ink">Юридична адреса</p>
              <p className="mt-3 text-[16px] leading-relaxed text-text/80">Запоріжжя, вул. Володимира Грищенка, 26А. Зустрічі — онлайн, клієнти по всій Україні.</p>
            </div>
          </div>
          <div className="mt-10"><Cta>Заповнити анкету</Cta></div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
