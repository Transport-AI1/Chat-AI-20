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
    <div className="flex h-screen">
      <Sidebar view={view} onView={setView} usage={usage} plan={plan} />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2">
          <h2 className="text-sm font-medium">{TITLES[view]}</h2>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-full border border-white/10 bg-panel px-3 py-1 text-xs"
          >
            {MODELS.map((m) => (
              <option key={m} value={m} disabled={!current.models.includes(m)}>
                {m}
              </option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className={`rounded-full border px-2 py-0.5 ${plan === "gratis" ? "border-white/15 text-zinc-400" : "border-vio text-vio"}`}>
              {current.name}
            </span>
            <button onClick={() => setView("plans")} className="btn bg-vio px-3 py-1 text-xs">
              Mejorar
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {view === "chat" && <ChatView model={model} onLimit={(t) => setDialog({ text: t })} />}
          {view === "img" && <ImageStudio onLimit={(t) => setDialog({ text: t })} />}
          {view === "plans" && <PlansView onConfirm={(t, fn) => setDialog({ text: t, confirm: fn })} />}
          {view === "set" && <SettingsView />}
        </div>

        <footer className="border-t border-white/10 px-4 py-1.5 text-[11px] text-zinc-500">
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