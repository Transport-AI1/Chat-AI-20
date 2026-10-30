"use client";

import { useMemo, useState } from "react";
import { ADS } from "@/lib/plans";

export function AdSlot({ enabled }: { enabled: boolean }) {
  const [closed, setClosed] = useState(false);
  const [index, setIndex] = useState(() => Math.floor(Math.random() * ADS.length));
  const ad = useMemo(() => ADS[index % ADS.length], [index]);

  if (!enabled || closed || !ad) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/15 px-3 py-2 text-[11px] text-zinc-400">
      <span>◆</span>
      <div>
        <b className="font-medium text-zinc-200">{ad.body}</b>
        <br />
        <span className="opacity-70">{ad.tag}</span>
      </div>
      <button
        onClick={() => { setIndex((i) => i + 1); if (Math.random() > 0.7) setClosed(true); }}
        className="ml-auto text-sm"
      >
        ×
      </button>
    </div>
  );
}