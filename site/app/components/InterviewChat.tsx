"use client";

import { Bot, CheckCircle2, Loader2, Send, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { REPLY_TIME, TELEGRAM } from "./ui";

type Msg = { role: "assistant" | "client"; text: string };

/* Interviewer agent: a short chat right after the form, so Karina comes to the call prepared. */
export default function InterviewChat({ token }: { token: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/chat?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!alive) return;
        setMessages(d.messages || []);
        setDone(Boolean(d.done));
      })
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [token]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const msg = text.trim();
    if (!msg || busy || done) return;
    setMessages((m) => [...m, { role: "client", text: msg }]);
    setText("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, message: msg }) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      if (d.reply) setMessages((m) => [...m, { role: "assistant", text: d.reply }]);
      setDone(Boolean(d.done));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    try {
      await fetch("/api/chat/finish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    } finally {
      setDone(true);
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-white">
      <div className="flex items-center gap-3 border-b border-line bg-ink px-5 py-4 text-white md:px-7">
        <CheckCircle2 className="size-6 shrink-0 text-teal" aria-hidden />
        <div className="flex-1">
          <p className="font-bold">Анкету отримано. Дякую!</p>
          <p className="text-sm text-white/65">Кілька коротких питань від AI-асистентки, щоб Карина підготувалась до розмови.</p>
        </div>
      </div>

      <div ref={listRef} className="max-h-[52vh] min-h-[240px] space-y-4 overflow-y-auto bg-paper px-4 py-6 md:px-7" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2.5 ${m.role === "client" ? "flex-row-reverse" : ""}`}>
            <span className={`grid size-8 shrink-0 place-items-center rounded-full ${m.role === "client" ? "bg-ink text-teal" : "bg-teal text-ink"}`}>
              {m.role === "client" ? <UserRound className="size-4" aria-hidden /> : <Bot className="size-4" aria-hidden />}
            </span>
            <p
              className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-3 text-[16px] leading-relaxed ${
                m.role === "client" ? "rounded-br-md bg-ink text-white" : "rounded-bl-md bg-white text-ink shadow-[0_1px_0_rgba(17,20,27,0.06)]"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden /> асистентка пише…
          </div>
        )}
      </div>

      {failed && !done && (
        <p className="border-t border-line px-5 py-3 text-sm text-muted md:px-7">
          Зв&apos;язок з асистенткою перервався. Анкета у Карини — вона відповість {REPLY_TIME}.
        </p>
      )}

      {done ? (
        <div className="flex flex-col gap-3 border-t border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
          <p className="text-[16px] font-semibold text-ink">Готово. Карина зв&apos;яжеться з вами {REPLY_TIME}.</p>
          <a href={TELEGRAM} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#039be5] px-5 py-2.5 text-[15px] font-bold text-white">
            <Send className="size-4" aria-hidden /> Telegram
          </a>
        </div>
      ) : (
        <form onSubmit={send} className="flex flex-col gap-3 border-t border-line p-4 sm:flex-row sm:items-end md:px-7">
          <label htmlFor="chat-msg" className="sr-only">Ваша відповідь</label>
          <textarea
            id="chat-msg"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
              }
            }}
            disabled={busy || failed}
            placeholder="Ваша відповідь…"
            className="min-h-12 flex-1 resize-none rounded-2xl border border-line bg-white px-4 py-3 text-[16px] outline-none focus:border-teal focus:ring-4 focus:ring-teal/25"
          />
          <div className="flex gap-2">
            <button type="button" onClick={finish} disabled={busy} className="rounded-full border border-line px-4 py-3 text-sm font-semibold text-muted hover:text-ink">
              Завершити
            </button>
            <button type="submit" disabled={busy || failed || !text.trim()} className="inline-flex items-center gap-2 rounded-full bg-teal px-5 py-3 font-bold text-ink disabled:opacity-50">
              <Send className="size-4" aria-hidden /> Надіслати
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
