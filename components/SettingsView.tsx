"use client";

import { useRef } from "react";
import { useStore } from "@/lib/store";

export function SettingsView() {
  const name = useStore((s) => s.name);
  const tone = useStore((s) => s.tone);
  const adsMode = useStore((s) => s.adsMode);
  const set = useStore((s) => s.set);
  const fileRef = useRef<HTMLInputElement>(null);

  function exportData() {
    const blob = new Blob([JSON.stringify(useStore.getState(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nexo-datos.json";
    a.click();
  }

  function importData(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        set(JSON.parse(String(reader.result)));
      } catch {
        /* archivo inválido */
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="max-w-md space-y-3 p-4 text-sm">
      <h3 className="text-base">Ajustes</h3>
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        Nombre
        <input value={name} onChange={(e) => set({ name: e.target.value })} maxLength={20} className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        Tono
        <select value={tone} onChange={(e) => set({ tone: e.target.value as "normal" | "breve" | "detallado" })} className="rounded-md border border-white/10 bg-panel px-2 py-1.5">
          <option value="normal">Normal</option>
          <option value="breve">Breve</option>
          <option value="detallado">Detallado</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        Anuncios
        <select value={adsMode} onChange={(e) => set({ adsMode: e.target.value as "auto" | "off" })} className="rounded-md border border-white/10 bg-panel px-2 py-1.5">
          <option value="auto">Automático (solo plan gratis)</option>
          <option value="off">Nunca</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button onClick={exportData} className="btn border border-white/10">Exportar datos</button>
        <button onClick={() => fileRef.current?.click()} className="btn border border-white/10">Importar</button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          hidden
          onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
        />
      </div>
      <p className="text-[11px] text-zinc-500">Datos en localStorage. Nada sale del navegador.</p>
    </div>
  );
}