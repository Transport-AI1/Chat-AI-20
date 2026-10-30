"use client";

import { useStore } from "@/lib/store";
import { PLANS } from "@/lib/plans";

type View = "chat" | "img" | "plans" | "set";

const NAV: { id: View; label: string; icon: string }[] = [
  { id: "chat", label: "Nuevo chat", icon: "✳" },
  { id: "img", label: "Crear imágenes", icon: "▧" },
  { id: "plans", label: "Planes", icon: "◇" },
  { id: "set", label: "Ajustes", icon: "⚙" },
];

export function Sidebar({ view, onView, usage, plan }: {
  view: View; onView: (v: View) => void; usage: { msg: number; img: number }; plan: keyof typeof PLANS;
}) {
  const convs = useStore((s) => s.convs);
  const current = useStore((s) => s.current);
  const set = useStore((s) => s.set);
  const newConversation = useStore((s) => s.newConversation);

  return (
    <aside className="flex h-full w-[258px] shrink-0 flex-col border-r border-white/[.07] bg-[#0d0e15]/95 px-3 py-4">
      <button onClick={() => onView("chat")} className="mb-7 flex items-center gap-3 px-2 text-left">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold shadow-lg shadow-violet-950/40">20</span>
        <span className="text-lg font-semibold tracking-tight">Chat 20 <span className="text-violet-400">AI</span><span className="mt-0.5 block text-[10px] font-normal tracking-[.18em] text-zinc-500">TU ESPACIO DE IA</span></span>
      </button>

      <button onClick={() => { newConversation(); onView("chat"); }} className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/15 px-3 py-3 text-sm font-medium text-violet-100 transition hover:bg-violet-500/25">
        <span className="text-lg">＋</span> Nueva conversación
      </button>

      <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[.18em] text-zinc-600">Workspace</div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <button key={item.id} onClick={() => onView(item.id)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition ${view === item.id ? "bg-white/[.09] text-white shadow-inner" : "text-zinc-400 hover:bg-white/[.04] hover:text-zinc-200"}`}>
            <span className="w-5 text-center text-base">{item.icon}</span>{item.label}
            {item.id === "plans" && <span className="ml-auto rounded-md bg-violet-500/15 px-1.5 py-0.5 text-[9px] text-violet-300">PRO</span>}
          </button>
        ))}
      </nav>

      <div className="mb-2 mt-8 flex items-center justify-between px-2">
        <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-zinc-600">Recientes</span>
        <span className="text-[10px] text-zinc-600">{convs.length}</span>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {convs.map((c) => (
          <button key={c.id} onClick={() => { set({ current: c.id }); onView("chat"); }} className={`block w-full truncate rounded-lg px-3 py-2 text-left text-xs transition ${current === c.id ? "bg-white/[.07] text-zinc-100" : "text-zinc-500 hover:bg-white/[.04] hover:text-zinc-300"}`}>
            <span className="mr-2 text-zinc-600">◦</span>{c.title}
          </button>
        ))}
        {convs.length === 0 && <p className="px-3 py-2 text-xs text-zinc-700">Tus conversaciones aparecerán aquí.</p>}
      </div>

      <div className="mt-4 rounded-2xl border border-white/[.07] bg-white/[.025] p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-300">Plan {PLANS[plan].name}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-zinc-500"><span>Mensajes de hoy</span><span>{usage.msg}/{PLANS[plan].msgs}</span></div>
        <button onClick={() => onView("plans")} className="mt-3 w-full rounded-lg bg-white/[.07] py-2 text-xs text-zinc-200 transition hover:bg-white/[.12]">Ver planes</button>
      </div>
    </aside>
  );
}