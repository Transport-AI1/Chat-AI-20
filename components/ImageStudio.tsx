"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PLANS } from "@/lib/plans";
import { STYLES, render, type Style } from "@/lib/imagen";
import { uid } from "@/lib/rng";

const SIZES: Record<string, [number, number]> = {
  "512": [512, 512],
  "768": [768, 768],
  "512x768": [512, 768],
};

export function ImageStudio({ onLimit }: { onLimit: (t: string) => void }) {
  const plan = useStore((s) => s.plan);
  const usage = useStore((s) => s.usage);
  const images = useStore((s) => s.images);
  const addImage = useStore((s) => s.addImage);
  const useImg = useStore((s) => s.useImg);

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<Style>("malla");
  const [size, setSize] = useState("512");
  const [status, setStatus] = useState("");

  function generate() {
    if (usage.img >= PLANS[plan].imgs) {
      onLimit(`Has agotado las imágenes de hoy en el plan ${PLANS[plan].name}.`);
      return;
    }
    const [w, h] = SIZES[size] ?? [512, 512];
    const canvas = render(prompt.trim() || "composición abstracta", style, w, h);
    const url = canvas.toDataURL("image/png");
    addImage({ id: uid(), url, prompt: prompt || "sin prompt", style });
    useImg();
    setStatus(`Generada · ${usage.img + 1}/${PLANS[plan].imgs}`);
  }

  return (
    <div className="space-y-3 p-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
        placeholder="Una ciudad flotante al atardecer, estilo pictórico"
        className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap items-end gap-2 text-xs">
        <label className="flex flex-col gap-1 text-zinc-400">
          Estilo
          <select value={style} onChange={(e) => setStyle(e.target.value as Style)} className="rounded-md border border-white/10 bg-panel px-2 py-1.5">
            {STYLES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-zinc-400">
          Formato
          <select value={size} onChange={(e) => setSize(e.target.value)} className="rounded-md border border-white/10 bg-panel px-2 py-1.5">
            <option value="512">512 × 512</option>
            <option value="768">768 × 768</option>
            <option value="512x768">512 × 768</option>
          </select>
        </label>
        <button onClick={generate} className="btn bg-vio text-white">Generar</button>
        <span className="text-zinc-500">{status}</span>
      </div>
      <p className="text-[11px] text-zinc-500">
        Generación procedural en canvas, sin red. No es un modelo difusor: es composición por semilla a partir de tu prompt.
      </p>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="overflow-hidden rounded-lg border border-white/10 bg-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.prompt} className="aspect-square w-full object-cover" />
            <div className="flex items-center gap-1 p-1.5 text-[10px] text-zinc-400">
              <span className="flex-1 truncate">{img.prompt}</span>
              <a href={img.url} download={`nexo-${img.id}.png`} className="rounded border border-white/10 px-1.5">↓</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}