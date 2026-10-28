"use client";

import { useEffect, useState } from "react";
import type { ModelInfo } from "@/lib/types";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export default function ModelPicker({ value, onChange }: Props) {
  const [models, setModels] = useState<ModelInfo[]>([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/models")
      .then((r) => r.json())
      .then((d: { models?: ModelInfo[] }) => {
        if (alive && Array.isArray(d.models)) setModels(d.models);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="max-w-[220px] truncate rounded-lg border border-white/10 bg-[#101014] px-2 py-1.5 text-xs text-zinc-300 outline-none hover:border-white/20"
    >
      {models.length === 0 ? <option value={value}>{value}</option> : null}
      {models.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
