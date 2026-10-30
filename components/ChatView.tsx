"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { PLANS } from "@/lib/plans";
import { respond, stream } from "@/lib/engine";
import { renderMarkdown } from "@/lib/markdown";
import { AdSlot } from "./AdSlot";

const SUGGESTIONS = [
  { icon: "✦", title: "Escribe algo", prompt: "Ayúdame a redactar un documento profesional" },
  { icon: "⌘", title: "Programa", prompt: "Explícame cómo crear una aplicación con React" },
  { icon: "▤", title: "Organiza mis ideas", prompt: "Ayúdame a organizar un proyecto paso a paso" },
  { icon: "◎", title: "Aprende algo", prompt: "Enséñame un tema nuevo con ejemplos sencillos" },
];

const ROLES: Record<string, { name: string; icon: string; description: string }> = {
  abogado: { name: "Abogado", icon: "⚖", description: "Análisis jurídico y documentos legales" },
  policia: { name: "Policía", icon: "✧", description: "Procedimientos y normativa policial" },
  juez: { name: "Juez", icon: "§", description: "Análisis neutral de argumentos y pruebas" },
  medico: { name: "Médico", icon: "✚", description: "Información sanitaria general" },
  programador: { name: "Programador", icon: "⌘", description: "Código, arquitectura y depuración" },
  marketing: { name: "Marketing", icon: "↗", description: "Estrategia, marca y campañas" },
  profesor: { name: "Profesor", icon: "▤", description: "Explicaciones y aprendizaje" },
  contador: { name: "Contable", icon: "∑", description: "Contabilidad y fiscalidad" },
  empresario: { name: "Empresario", icon: "◇", description: "Negocio y gestión empresarial" },
};

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
  const [role, setRole] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const conv = convs.find((c) => c.id === current);
  const hasMessages = Boolean(conv?.msgs.length);

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

    const command = clean.match(/^\/([a-záéíóú]+)\s*$/i);
    if (command) {
      const key = (command[1] ?? "").toLowerCase();
      if (ROLES[key]) {
        setRole(key);
        setDraft("");
        const id = current ?? newConversation();
        addMessage(id, "u", clean);
        addMessage(id, "a", `**Modo ${ROLES[key].name} seleccionado.**\n\n${ROLES[key].description}.\n\nLa selección del modo ya está preparada en la interfaz. La conexión a un modelo de IA que aplique de verdad esta especialización se implementará en la siguiente fase, cuando integremos las APIs.`);
        return;
      }
      if (key === "normal" || key === "general") {
        setRole(null);
        setDraft("");
        const id = current ?? newConversation();
        addMessage(id, "u", clean);
        addMessage(id, "a", "Has vuelto al modo general.");
        return;
      }
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
    <div className="flex min-h-full flex-col">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 pb-5 pt-8 md:px-10">
        {!hasMessages && (
          <div className="mx-auto my-auto w-full max-w-2xl py-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-indigo-500/10 text-2xl text-violet-200 shadow-2xl shadow-violet-950/30">✳</div>
              <p className="mb-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">¿Qué vamos a crear hoy?</p>
              <p className="text-sm text-zinc-500">Tu espacio para preguntar, escribir, analizar y construir.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button key={s.title} onClick={() => void send(s.prompt)} className="group rounded-2xl border border-white/[.08] bg-white/[.025] p-4 text-left transition hover:border-violet-400/30 hover:bg-violet-500/[.06]">
                  <span className="mb-3 grid h-8 w-8 place-items-center rounded-lg bg-white/[.06] text-base text-violet-300 transition group-hover:bg-violet-500/15">{s.icon}</span>
                  <span className="block text-sm font-medium text-zinc-200">{s.title}</span>
                  <span className="mt-1 block text-xs text-zinc-500">{s.prompt}</span>
                </button>
              ))}
            </div>
            <p className="mt-5 text-center text-[10px] text-zinc-600">Prueba un modo profesional: /abogado · /policia · /juez · /programador</p>
          </div>
        )}

        {hasMessages && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.025] px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/15 text-violet-200">{role ? ROLES[role].icon : "✳"}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-200">{role ? `Modo ${ROLES[role].name}` : "Modo general"}</p>
              <p className="truncate text-[10px] text-zinc-500">{role ? ROLES[role].description : "Asistente general de Chat 20 AI"}</p>
            </div>
            {role && <button onClick={() => setRole(null)} className="text-[10px] text-zinc-500 hover:text-white">Cambiar</button>}
          </div>
        )}

        <div className="space-y-6">
          {conv?.msgs.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "u" ? "justify-end" : "justify-start"}`}>
              {m.role === "a" && <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">20</div>}
              <div className={`bub max-w-[min(780px,88%)] rounded-2xl px-4 py-3 text-sm leading-7 ${m.role === "u" ? "border border-violet-400/15 bg-violet-500/10 text-violet-50" : "border border-white/[.06] bg-[#14151d] text-zinc-300"}`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }} />
              {m.role === "u" && <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.06] text-xs text-zinc-300">Tú</div>}
            </div>
          ))}
          {partial !== null && (
            <div className="flex gap-3">
              <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">20</div>
              <div className="bub max-w-[min(780px,88%)] rounded-2xl border border-white/[.06] bg-[#14151d] px-4 py-3 text-sm leading-7 text-zinc-300" dangerouslySetInnerHTML={{ __html: renderMarkdown(partial) }} />
            </div>
          )}
        </div>
        <AdSlot enabled={PLANS[plan].ads && adsMode !== "off"} />
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 border-t border-white/[.06] bg-[#090a0f]/90 px-5 pb-5 pt-4 backdrop-blur-xl md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-white/[.11] bg-[#151620] p-2 shadow-2xl shadow-black/30 transition focus-within:border-violet-400/35">
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(draft); } }}
              rows={2} placeholder="Escribe tu mensaje o utiliza /abogado, /juez..."
              className="max-h-36 w-full resize-none bg-transparent px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600" />
            <div className="flex items-center justify-between px-1 pb-1">
              <div className="flex items-center gap-1.5">
                <button onClick={() => setDraft((v) => v + "/")} className="rounded-lg px-2 py-1.5 text-xs text-zinc-500 hover:bg-white/[.06] hover:text-zinc-200" title="Comandos profesionales">/ Comandos</button>
                <span className="hidden text-[10px] text-zinc-600 sm:inline">Shift + Enter para nueva línea</span>
              </div>
              <button onClick={() => void send(draft)} disabled={busy || !draft.trim()} className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-lg text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 disabled:opacity-40">↑</button>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] text-zinc-600">Chat 20 AI puede cometer errores. Comprueba la información importante.</p>
        </div>
      </div>
    </div>
  );
}