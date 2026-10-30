"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { PLANS } from "@/lib/plans";
import { respond, stream } from "@/lib/engine";
import { renderMarkdown } from "@/lib/markdown";
import { AdSlot } from "./AdSlot";

const SUGGESTIONS = [
  "Explícame cómo funciona el event loop de JavaScript",
  "Escríbeme un componente de React para un contador con hooks",
  "Dame un plan de estudio de 4 semanas para aprender TypeScript",
  "Ideas de nombres para una marca de café de especialidad",
];

export function ChatView({ model, onLimit }: { model: string; onLimit: (t: string) => void }) {
  const convs = useStore((s) => s.convs);
  const current = useStore((s) => s.current);
  const plan = useStore((s) => s.plan);
  const usage = useStore((s) => s.usage);
  const addMessage = useStore((s) => s.addMessage);
  const newConversation = useStore((s) => s.newConversation);
  const useMsg = useStore((s) => s.useMsg);
  const adsMode = useStore((s) => s.adsMode);

  const [draft, setDraft] = useState("");
  const [partial, setPartial] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const conv = convs.find((c) => c.id === current);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv?.msgs.length, partial]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    if (usage.msg >= PLANS[plan].msgs) {
      onLimit(`Has agotado los mensajes de hoy en el plan ${PLANS[plan].name}.`);
      return;
    }

    const id = current ?? newConversation();
    setDraft("");
    setBusy(true);
    useMsg();
    addMessage(id, "u", clean);
    setPartial("");

    const full = respond(clean);
    await stream(full, setPartial, model === "nexo-ligero" ? 7 : 4);
    addMessage(id, "a", full);
    setPartial(null);
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {(!conv || conv.msgs.length === 0) && (
        <div className="mx-auto mt-10 max-w-md text-center text-sm text-zinc-400">
          <p className="mb-2 text-base font-medium text-zinc-100">¿En qué te ayudo?</p>
          <p>Todo corre en tu navegador: sin servidores ni claves.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-full border border-white/10 px-3 py-1 text-[11px]">
                {s.slice(0, 26)}…
              </button>
            ))}
          </div>
        </div>
      )}

      {conv?.msgs.map((m) => (
        <div key={m.id} className="flex gap-2">
          <div className={`h-6 w-6 shrink-0 rounded-md text-center text-xs font-bold leading-6 ${m.role === "u" ? "bg-white/10" : "bg-vio text-white"}`}>
            {m.role === "u" ? "T" : "N"}
          </div>
          <div
            className={`bub max-w-xl rounded-lg border border-white/10 px-3 py-2 text-sm leading-relaxed ${m.role === "u" ? "bg-white/5" : "bg-panel"}`}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }}
          />
        </div>
      ))}

      {partial !== null && (
        <div className="flex gap-2">
          <div className="h-6 w-6 shrink-0 rounded-md bg-vio text-center text-xs font-bold leading-6 text-white">N</div>
          <div className="bub max-w-xl rounded-lg border border-white/10 bg-panel px-3 py-2 text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(partial) }} />
        </div>
      )}

      <AdSlot enabled={PLANS[plan].ads && adsMode !== "off"} />
      <div ref={endRef} />

      <div className="sticky bottom-0 flex gap-2 bg-ink/80 py-2 backdrop-blur">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(draft);
            }
          }}
          rows={1}
          placeholder="Escribe un mensaje…"
          className="max-h-28 flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
        <button onClick={() => void send(draft)} disabled={busy} className="h-9 w-9 rounded-lg bg-vio text-white">
          ↑
        </button>
      </div>
    </div>
  );
}