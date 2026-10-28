"use client";

import type { Settings } from "@/lib/types";

interface Props {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

export default function SettingsPanel({ settings, onChange }: Props) {
  return (
    <div className="space-y-4 border-b border-white/10 bg-[#0d0d11] px-4 py-4 md:px-8">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-400">
          Prompt de sistema
        </label>
        <textarea
          value={settings.systemPrompt}
          onChange={(e) => onChange({ systemPrompt: e.target.value })}
          rows={6}
          className="w-full resize-y rounded-lg border border-white/10 bg-[#101014] p-3 text-xs text-zinc-200 outline-none focus:border-emerald-600/60"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          Temperatura
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.05}
            value={settings.temperature}
            onChange={(e) => onChange({ temperature: Number(e.target.value) })}
            className="w-40 accent-emerald-500"
          />
          <span className="w-8 font-mono text-zinc-300">{settings.temperature.toFixed(2)}</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={settings.webSearch}
            onChange={(e) => onChange({ webSearch: e.target.checked })}
            className="accent-emerald-500"
          />
          Búsqueda web
        </label>
      </div>
    </div>
  );
}
