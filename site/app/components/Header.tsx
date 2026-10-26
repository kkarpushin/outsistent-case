"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ANKETA, Cta, SITE_LINKS } from "./ui";

export const LANDING_LINKS = [
  { href: "#shcho-bachyt-bank", label: "Що бачить банк" },
  { href: "#yak-tse-pratsiuie", label: "Як це працює" },
  { href: "#tsiny", label: "Ціни" },
  { href: "#pro-mene", label: "Про мене" },
  { href: "#pytannia", label: "Питання" },
];

export default function Header({ links = SITE_LINKS, current }: { links?: { href: string; label: string }[]; current?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="relative z-30 mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 pt-5 md:px-8 md:pt-7">
      <a href="/" className="shrink-0" aria-label="Outsistent — на головну">
        <img src="/images/logo.png" alt="Outsistent, аутсорсингова компанія" width={230} height={61} className="h-10 w-auto md:h-11" />
      </a>

      <nav aria-label="Розділи" className="hidden rounded-full border border-white/70 bg-white/70 px-2 py-1.5 backdrop-blur lg:block">
        <ul className="flex items-center">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={current === l.href ? "page" : undefined}
                className="block rounded-full px-3.5 py-2 text-[14px] font-semibold text-ink/75 transition-colors hover:bg-white hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-white xl:px-4"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="hidden md:block">
        <Cta className="!py-1.5 !text-[14px]">Анкета</Cta>
      </div>

      <button
        type="button"
        data-menu-open
        onClick={() => setOpen(true)}
        className="grid size-11 place-items-center rounded-full bg-white/80 text-ink backdrop-blur md:hidden"
        aria-label="Відкрити меню"
        aria-expanded={open}
      >
        <Menu className="size-5" />
      </button>

      <div
        className={`fixed inset-0 z-50 flex flex-col bg-ink/95 px-6 pb-10 pt-6 backdrop-blur-md transition-opacity duration-500 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        data-menu
        role="dialog"
        aria-modal="true"
        aria-label="Меню"
        hidden={!open}
      >
        <div className="flex items-center justify-between">
          <img src="/images/logo-white.png" alt="Outsistent" width={230} height={61} className="h-10 w-auto" />
          <button type="button" data-menu-close onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full bg-white/10 text-white" aria-label="Закрити меню">
            <X className="size-5" />
          </button>
        </div>
        <ul className="mt-12 space-y-5">
          {links.map((l, i) => (
            <li key={l.href} style={{ transitionDelay: `${100 + i * 60}ms` }} className={`transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
              <a href={l.href} data-menu-link onClick={() => setOpen(false)} className="text-3xl font-semibold text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <Cta href={ANKETA}>Заповнити анкету</Cta>
        </div>
      </div>
    </header>
  );
}
