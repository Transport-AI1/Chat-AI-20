"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChatView } from "./ChatView";
import { ImageStudio } from "./ImageStudio";
import { PlansView } from "./PlansView";
import { SettingsView } from "./SettingsView";
import { UpgradeDialog } from "./UpgradeDialog";
import { useStore } from "@/lib/store";
import { MODELS, PLANS } from "@/lib/plans";
import { fmt, pct } from "@/lib/format";

type View = "chat" | "img" | "plans" | "set";

const TITLES: Record<View, string> = { chat: "Chat", img: "Imágenes", plans: "Planes", set: "Ajustes" };

export function App() {
  const [view, setView] = useState<View>("chat");
  const [model, setModel] = useState("nexo-3");
  const [dialog, setDialog] = useState<{ text: string; confirm?: () => void } | null>(null);

  const plan = useStore((s) => s.plan);
  const usage = useStore((s) => s.usage);
  const rollDay = useStore((s) => s.rollDay);

  useEffect(() => rollDay(), [rollDay]);

  const current = PLANS[plan];

  return (
    <div className="flex h-screen bg-[#090a0f]">
      <Sidebar view={view} onView={setView} usage={usage} plan={plan} />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="glass z-10 flex min-h-[68px] flex-wrap items-center gap-3 border-b border-white/[.07] px-6 py-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{TITLES[view]}</h2>
            <p className="mt-0.5 text-[10px] text-zinc-500">Un espacio para pensar, crear y resolver</p>
          </div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-full border border-white/10 bg-[#171824] px-3 py-2 text-xs text-zinc-200"
          >
            {MODELS.map((m) => (
              <option key={m} value={m} disabled={!current.models.includes(m)}>
                {m}
              </option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className={`rounded-full border px-3 py-1.5 text-[11px] ${plan === "gratis" ? "border-white/10 bg-white/[.04] text-zinc-400" : "border-violet-400/20 bg-violet-500/10 text-violet-200"}`}>
              {current.name}
            </span>
            <button onClick={() => setView("plans")} className="btn rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs text-white shadow-lg shadow-violet-950/30">
              Mejorar
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto">
          {view === "chat" && <ChatView model={model} onLimit={(t) => setDialog({ text: t })} />}
          {view === "img" && <ImageStudio onLimit={(t) => setDialog({ text: t })} />}
          {view === "plans" && <PlansView onConfirm={(t, fn) => setDialog({ text: t, confirm: fn })} />}
          {view === "set" && <SettingsView />}
        </div>

        <footer className="border-t border-white/[.06] bg-[#0d0e15]/80 px-6 py-2 text-[10px] text-zinc-500">
          {current.msgs > 9000 ? "Mensajes ilimitados" : `${fmt(usage.msg)}/${current.msgs} mensajes`} ·{" "}
          {current.imgs > 9000 ? "imágenes ilimitadas" : `${fmt(usage.img)}/${current.imgs} imágenes`}
          <span className="ml-2 inline-block h-1 w-24 overflow-hidden rounded bg-white/10 align-middle">
            <i className="block h-full bg-vio" style={{ width: `${pct(usage.msg, current.msgs)}%` }} />
          </span>
        </footer>
      </main>

      {dialog && (
        <UpgradeDialog
          text={dialog.text}
          confirm={dialog.confirm}
          onClose={() => setDialog(null)}
          onSeePlans={() => setView("plans")}
        />
      )}
    </div>
  );
}