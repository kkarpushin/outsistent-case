import { Clock3 } from "lucide-react";
import Header, { LANDING_LINKS } from "./Header";
import { ArrowCurlDown, Cta } from "./ui";

/* Landing first screen: one line of offer, one action, the living scene. */
export default function Hero() {
  return (
    <section className="hero43 relative isolate overflow-hidden bg-[#e3e3e4]">
      <Header links={LANDING_LINKS} />

      <div className="hero43-text relative mx-auto flex max-w-[1200px] flex-col justify-center px-4 pt-8 md:px-8 lg:min-h-[min(100svh-96px,760px)] lg:pb-16 lg:pt-6">
        <div className="relative z-10 max-w-[600px] animate-rise">
          <h1 className="text-[42px] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[56px] lg:text-[72px]">
            Ваші рахунки&nbsp;— <span className="mk">очима банку</span>
          </h1>
          <p className="mt-6 max-w-[480px] text-[18px] leading-[1.5] text-text md:text-[20px]">
            Карта ризиків ваших ФОП за 3&nbsp;робочі дні — до того, як банк попросить документи.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Cta />
            <a href="#samoperevirka" className="group inline-flex min-h-11 items-center gap-1 text-ink">
              <span className="font-hand text-[26px] leading-none underline decoration-teal decoration-2 underline-offset-[6px] group-hover:text-teal-deep">спершу самоперевірка</span>
              <ArrowCurlDown className="-mb-3 h-10 w-12 rotate-[20deg]" />
            </a>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-text/75">
            <Clock3 className="size-4 text-teal-deep" strokeWidth={2} aria-hidden />
            5–7 хвилин. Без оплати та зобов&apos;язань.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <img src="/images/karina-160.webp" alt="" className="size-11 rounded-full border-2 border-white object-cover" />
            <p className="text-sm leading-snug text-text/80">
              <b className="font-bold text-ink">Карина Замкова</b>
              <br />
              податковий консультант · 15&nbsp;років в&nbsp;обліку
            </p>
          </div>
        </div>
      </div>

      {/* Main scene: miniature accountants check every figure (Higgsfield). Below the text up to lg,
          then the right half at full height with a soft left edge. Still image when motion is reduced. */}
      <div className="hero43-scene relative mt-10 aspect-[4/3] w-full lg:absolute lg:inset-y-0 lg:left-[46%] lg:right-0 lg:-z-10 lg:mt-0 lg:aspect-auto lg:w-auto lg:[mask-image:linear-gradient(to_right,transparent,black_64px)]">
        <img
          src="/images/hero-desk-1280.webp"
          srcSet="/images/hero-desk-1280.webp 1280w, /images/hero-desk-2400.webp 2400w"
          sizes="(min-width: 1024px) 54vw, 100vw"
          alt="Мініатюрні бухгалтери з лупами перевіряють кожну цифру в податкових деклараціях і виписці з рахунку"
          className="h-full w-full animate-fade object-cover object-[60%_center] lg:object-[88%_center]"
          fetchPriority="high"
        />
        <video
          className="absolute inset-0 hidden h-full w-full object-cover object-[60%_center] lg:object-[88%_center] motion-safe:block"
          src="/video/hero-loop.mp4"
          poster="/images/hero-desk-1280.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#e3e3e4] to-transparent lg:hidden" />

        <div className="absolute right-8 top-[16%] hidden w-[220px] rounded-2xl bg-white/95 p-4 shadow-[0_18px_40px_-20px_rgba(17,20,27,0.45)] lg:block">
          <p className="text-[16px] font-bold text-ink">Карта ризиків</p>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-ink">
            <li className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-risk-critical" />критично</li>
            <li className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-risk-important" />важливо</li>
            <li className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-teal" />допустимо</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
