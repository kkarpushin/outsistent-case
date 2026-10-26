"use client";

import {
  ArrowLeftRight,
  Check,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CreditCard,
  FileQuestionMark,
  Gauge,
  MapPin,
  ReceiptText,
  Store,
  TrendingUp,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Cta, Section } from "./ui";

const signs = [
  { icon: Store, text: "Кілька ФОП працюють на одну справу: один сайт, магазин на маркетплейсі чи точка продажу" },
  { icon: MapPin, text: "У ФОП спільна адреса, телефон або бухгалтер" },
  { icon: CreditCard, text: "Один POS-термінал чи еквайринг обслуговує різні ФОП" },
  { icon: Gauge, text: "Один із ФОП за 2–3 місяці вибирає майже весь річний ліміт" },
  { icon: TrendingUp, text: "Обороти різко виросли проти тих, що ви вказували банку" },
  { icon: Wallet, text: "Гроші від покупців приходять і на ФОП, і на особисту картку" },
  { icon: ReceiptText, text: "Призначення платежу не відповідає КВЕДам" },
  { icon: ArrowLeftRight, text: "На початок і кінець дня на рахунку майже нуль" },
  { icon: Users, text: "Серед ФОП є чоловік, дружина чи інші родичі" },
  { icon: FileQuestionMark, text: "Ви не пам'ятаєте, що писали банку в анкеті клієнта" },
];

function verdict(n: number) {
  if (n === 0)
    return { icon: CircleDashed, tone: "bg-white/10 text-white/80", dot: "bg-white/15", title: "Позначте, що є у вашому бізнесі", text: "Результат з'явиться одразу, нічого не зберігаємо." };
  if (n <= 2)
    return { icon: CircleCheck, tone: "bg-tint text-teal-deep", dot: "bg-teal", title: "Схоже, банку нема до чого чіплятися", text: "Збережіть список і перевіряйте себе раз на квартал." };
  if (n <= 5)
    return { icon: CircleAlert, tone: "bg-[#fff3df] text-[#8a5300]", dot: "bg-risk-important", title: "Банк може поставити запитання", text: "Краще підготувати відповіді заздалегідь, ніж збирати документи за три дні." };
  return { icon: TriangleAlert, tone: "bg-[#fde8e8] text-[#9b1c20]", dot: "bg-risk-critical", title: "Це картина, яку банк бачить як один бізнес", text: "Варто подивитися на структуру до запиту, а не після." };
}

export default function SelfCheck() {
  const [marked, setMarked] = useState<boolean[]>(() => signs.map(() => false));
  const [inView, setInView] = useState(false);
  const listRef = useRef<HTMLFieldSetElement>(null);
  const count = marked.filter(Boolean).length;
  const v = verdict(count);

  // phones: keep the score visible in a bar at the bottom while the list is on screen
  useEffect(() => {
    const el = listRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Section id="samoperevirka">
      <div data-sc className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-14">
        <div>
          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-[-0.015em] md:text-[44px]">
            Чи бачить банк ваші ФОП <span className="mk">як один бізнес</span>?
          </h2>
          <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-text/80">Позначте, що є у вашому бізнесі. Хвилина — і результат одразу.</p>

          <fieldset ref={listRef} className="mt-8 overflow-hidden rounded-[var(--radius-card)] bg-paper">
            <legend className="sr-only">Ознаки, які бачить банк</legend>
            {signs.map((s, i) => {
              const id = `sign-${i}`;
              return (
                <label
                  data-sc-row
                  key={id}
                  htmlFor={id}
                  className="flex cursor-pointer items-start gap-4 border-b border-white px-4 py-4 last:border-b-0 md:px-5"
                >
                  <span className="relative mt-0.5 grid size-6 shrink-0 place-items-center">
                    <input
                      id={id}
                      type="checkbox"
                      className="chk peer absolute inset-0 cursor-pointer rounded-md border-2 border-ink/30 bg-white checked:border-teal checked:bg-teal focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
                      checked={marked[i]}
                      onChange={() => setMarked((m) => m.map((x, j) => (j === i ? !x : x)))}
                    />
                    <Check className="pointer-events-none relative size-4 text-ink opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} aria-hidden />
                  </span>
                  <span className={`flex-1 text-[16.5px] leading-snug text-ink mk-grow ${marked[i] ? "on" : ""}`}>{s.text}</span>
                  <s.icon className={`mt-0.5 hidden size-5 shrink-0 sm:block ${marked[i] ? "text-ink" : "text-teal-deep"}`} strokeWidth={1.75} aria-hidden />
                </label>
              );
            })}
          </fieldset>
          <p className="mt-4 text-sm text-muted">Ознаки — з матеріалів банків і фахових видань, 2026. Пороги — наша підказка, а не норма банку.</p>
        </div>

        <aside>
          <div className="sticky top-6 rounded-[var(--radius-card)] bg-ink p-6 text-white md:p-8" aria-live="polite">
            <p className="text-sm font-semibold text-white/60">Ваш результат</p>
            <p className="mt-3 flex items-baseline gap-2">
              <span data-sc-count className="text-7xl font-extrabold leading-none tracking-tight text-teal tabular-nums">{count}</span>
              <span className="text-xl font-semibold text-white/60">/ 10</span>
            </p>
            <div className="mt-4 flex gap-1" aria-hidden>
              {signs.map((_, i) => (
                <span key={i} data-sc-bar className={`h-1.5 flex-1 rounded-full ${i < count ? v.dot : "bg-white/15"}`} />
              ))}
            </div>
            <div data-sc-verdict className={`mt-6 flex gap-3 rounded-2xl p-4 ${v.tone}`}>
              <v.icon className="mt-0.5 size-5 shrink-0" strokeWidth={2} aria-hidden />
              <div>
                <p data-sc-title className="font-bold">{v.title}</p>
                <p data-sc-text className="mt-1 text-[16px] leading-snug">{v.text}</p>
              </div>
            </div>
            <div className="mt-6">
              <Cta>Заповнити анкету</Cta>
            </div>
          </div>
        </aside>
      </div>

      {/* phone score bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 text-white transition-transform duration-300 lg:hidden ${
          inView ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold tabular-nums text-teal">{count}<span className="text-base text-white/50"> / 10</span></span>
          <div className="flex flex-1 gap-0.5">
            {signs.map((_, i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-full ${i < count ? v.dot : "bg-white/15"}`} />
            ))}
          </div>
        </div>
        <p className="mt-1.5 truncate text-sm font-semibold text-white/85">{v.title}</p>
      </div>
    </Section>
  );
}
