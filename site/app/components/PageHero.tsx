import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Header from "./Header";
import { ArrowSwoop, Cta, Eyebrow } from "./ui";

/* First screen of inner pages: short headline, one line of text, one action, a scene from the same miniature world */
export default function PageHero({
  current,
  eyebrow,
  eyebrowIcon,
  title,
  lede,
  image,
  imageAlt,
  chips = [],
  note,
  cta = <Cta />,
  secondary,
}: {
  current?: string;
  eyebrow: string;
  eyebrowIcon?: LucideIcon;
  title: ReactNode;
  lede: ReactNode;
  image: string;
  imageAlt: string;
  chips?: { icon: LucideIcon; label: string }[];
  note?: string;
  cta?: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[#e3e3e4]">
      <Header current={current} />
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 pb-14 pt-10 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-20 lg:pt-14">
        <div className="animate-rise">
          <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow>
          <h1 className="mt-5 text-[38px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[48px] lg:text-[50px] xl:text-[58px]">{title}</h1>
          <p className="mt-5 max-w-[480px] text-[18px] leading-[1.5] text-text/80">{lede}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4">
            {cta}
            {secondary}
          </div>
          {chips.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {chips.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-sm font-semibold text-ink backdrop-blur">
                  <Icon className="size-4 text-teal-deep" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative">
          <figure className="overflow-hidden rounded-[var(--radius-media)] shadow-[0_30px_60px_-40px_rgba(17,20,27,0.6)]">
            <img src={image} alt={imageAlt} className="aspect-[4/3] w-full animate-fade object-cover" fetchPriority="high" />
          </figure>
          {note && (
            <div className="pointer-events-none absolute -bottom-8 left-6 hidden items-start gap-1 text-ink md:flex">
              <ArrowSwoop className="h-8 w-14 -rotate-[150deg]" />
              <span className="mt-4 -rotate-2 font-hand text-[25px] leading-none">{note}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
