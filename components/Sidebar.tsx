"use client";

import { useStore } from "@/lib/store";
import { PLANS } from "@/lib/plans";

type View = "chat" | "img" | "plans" | "set";

export function Sidebar({
  view, onView, usage, plan,
}: {
  view: View;
  onView: (v: View) => void;
  usage: { msg: number; img: number };
  plan: keyof typeof PLANS;
}) {
  const convs = useStore((s) => s.convs);
  const current = useStore((s) => s.current);
  const set = useStore((s) => s.set);
  const newConversation = useStore((s) => s.newConversation);

  return (
    <aside className="flex w-52 flex-col border-r border-white/10 bg-panel p-2">
      <div className="px-1 pb-2 pt-1 text-[15px] font-bold tracking-tight">
        nexo<span className="text-vio">.</span>ai
      </div>
      <button onClick={() => { newConversation(); onView("chat"); }} className="rounded-lg bg-vio py-2 text-xs font-medium text-white">
        + Nueva conversación
      </button>

      <nav className="mt-2 flex flex-col gap-0.5">
        {(["chat", "img", "plans", "set"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`rounded-md px-2 py-1.5 text-left text-xs ${view === v ? "bg-white/10 font-medium" : "text-zinc-400"}`}
          >
            {{ chat: "Chat", img: "Imágenes", plans: "Planes", set: "Ajustes" }[v]}
          </button>
        ))}
      </nav>

      <div className="mt-3 flex-1 overflow-auto">
        {convs.map((c) => (
          <button
            key={c.id}
            onClick={() => { set({ current: c.id }); onView("chat"); }}
            className={`block w-full truncate rounded-md px-2 py-1.5 text-left text-xs ${current === c.id ? "bg-white/10" : "text-zinc-400"}`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="border-t border-white/10 pt-2 text-[11px] text-zinc-500">
        Plan {PLANS[plan].name} · {usage.msg}/{PLANS[plan].msgs}
      </div>
    </aside>
  );
}