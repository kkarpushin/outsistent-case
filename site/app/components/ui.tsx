import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export const ANKETA = "/anketa/";
export const PHONE = "+38 (096) 55-88-500";
export const PHONE_HREF = "tel:+380965588500";
export const PHONE_2 = "+38 (099) 55-88-500";
export const EMAIL = "info@outsistent.com.ua";
export const REPLY_TIME = "протягом робочого дня";
export const TELEGRAM = "https://t.me/outsistentZP";
export const INSTAGRAM_DM = "https://ig.me/m/karina_zamkova";

/* Main call to action: teal pill with dark text and a dark circle holding the arrow */
export function Cta({
  href = ANKETA,
  children = "Заповнити анкету",
  tone = "teal",
  className = "",
}: {
  href?: string;
  children?: ReactNode;
  tone?: "teal" | "light";
  className?: string;
}) {
  const skin =
    tone === "teal"
      ? "bg-teal text-ink hover:bg-teal-hover"
      : "bg-white text-ink hover:bg-tint";
  return (
    <a
      href={href}
      {...(/^https?:/.test(href) ? { target: "_blank", rel: "noopener" } : {})}
      className={`group inline-flex items-center gap-3 rounded-full py-2 pl-6 pr-2 text-[16px] font-bold transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal-deep ${skin} ${className}`}
    >
      <span>{children}</span>
      <span className="grid size-10 place-items-center rounded-full bg-ink text-teal transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
        <ArrowUpRight className="size-5" strokeWidth={2.4} aria-hidden />
      </span>
    </a>
  );
}

export const SITE_LINKS = [
  { href: "/ochyma-banku/", label: "Очима банку" },
  { href: "/audyt/", label: "Аудит" },
  { href: "/suprovid/", label: "Супровід" },
  { href: "/samoperevirka/", label: "Самоперевірка" },
  { href: "/pro-karynu/", label: "Про Карину" },
  { href: "/kontakty/", label: "Контакти" },
];

export function Eyebrow({ children, dark = false, icon: Icon }: { children: ReactNode; dark?: boolean; icon?: LucideIcon }) {
  return (
    <span className={`eyebrow ${dark ? "eyebrow-dark" : ""}`}>
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  );
}

/* Icon on a soft tile: the site's repeating icon device */
export function IconTile({
  icon: Icon,
  tone = "tint",
  size = "md",
  className = "",
}: {
  icon: LucideIcon;
  tone?: "tint" | "teal" | "ink" | "dark" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const skin = {
    tint: "bg-tint text-teal-deep",
    teal: "bg-teal text-ink",
    ink: "bg-ink text-teal",
    dark: "bg-white/[0.07] text-teal ring-1 ring-white/10",
    white: "bg-white text-teal-deep ring-1 ring-line",
  }[tone];
  const box = { sm: "size-9 rounded-[10px]", md: "size-11 rounded-xl", lg: "size-14 rounded-2xl" }[size];
  const ic = { sm: "size-5", md: "size-6", lg: "size-7" }[size];
  return (
    <span className={`grid shrink-0 place-items-center ${box} ${skin} ${className}`}>
      <Icon className={ic} strokeWidth={1.75} aria-hidden />
    </span>
  );
}

/* Visible placeholder for facts the client still has to give us */
export function Fill({ children }: { children: ReactNode }) {
  return (
    <span className="mx-0.5 inline-block rounded-md border border-dashed border-risk-important bg-[#fff6e8] px-1.5 py-0.5 align-baseline font-sans text-[0.8em] font-semibold text-[#8a5300]">
      {"{ЗАПОЛНИТЬ: "}
      {children}
      {"}"}
    </span>
  );
}

/* Hand-drawn arrows, stroke in currentColor */
export function ArrowCurlDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" fill="none" className={className} aria-hidden>
      <path
        d="M8 10c22-6 52-2 62 16 9 16-8 26-17 18-9-9 6-24 24-20 19 4 30 24 30 48"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M96 64l11 10 8-13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowSwoop({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 60" fill="none" className={className} aria-hidden>
      <path
        d="M6 44C34 12 82 4 128 22"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M114 10l15 12-17 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 px-4 py-16 md:px-8 md:py-24 lg:py-28 ${className}`}>
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </section>
  );
}
