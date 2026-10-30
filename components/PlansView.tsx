"use client";

import { useStore } from "@/lib/store";
import { PLANS, type PlanId } from "@/lib/plans";
import { fmt } from "@/lib/format";

export function PlansView({ onConfirm }: { onConfirm: (text: string, confirm: () => void) => void }) {
  const plan = useStore((s) => s.plan);
  const set = useStore((s) => s.set);

  function choose(id: PlanId) {
    if (id === plan) return;
    const target = PLANS[id];
    if (target.price === 0) return set({ plan: id });
    onConfirm(`Vas a cambiar al plan ${target.name} por ${fmt(target.price)} €/mes.`, () => set({ plan: id }));
  }

  return (
    <div className="space-y-3 p-4">
      <h3 className="text-base">Planes</h3>
      <p className="text-xs text-zinc-400">Los límites se aplican en el cliente. Sin pasarela: el cobro es simulado.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(PLANS) as PlanId[]).map((id) => {
          const p = PLANS[id];
          return (
            <div key={id} className={`rounded-xl border p-3 ${id === plan ? "border-vio" : "border-white/10"}`}>
              <h4 className="text-sm font-medium">{p.name}</h4>
              <p className="my-1 text-xl font-bold">
                {p.price ? `${p.price} €` : "0 €"}
                <span className="text-[11px] font-normal text-zinc-500">/mes</span>
              </p>
              <ul className="mb-2 space-y-1 text-[11px] text-zinc-400">
                {p.perks.map((x) => <li key={x}>· {x}</li>)}
              </ul>
              <button
                onClick={() => choose(id)}
                disabled={id === plan}
                className={`btn w-full ${id === plan ? "border border-white/10" : "bg-vio text-white"}`}
              >
                {id === plan ? "Plan actual" : "Elegir"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}