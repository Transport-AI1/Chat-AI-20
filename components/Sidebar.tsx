"use client";

import type { Conversation } from "@/lib/types";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  open,
  onClose,
}: Props) {
  return (
    <>
      {open ? (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          aria-hidden
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-white/10 bg-[#0b0b0e] transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-3">
          <span className="text-sm font-semibold tracking-tight text-zinc-100">Chat sin filtros</span>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 md:hidden"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={onNew}
            className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            + Nueva conversación
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
          {conversations.length === 0 ? (
            <p className="px-2 py-4 text-xs text-zinc-600">Aún no hay conversaciones.</p>
          ) : null}

          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center gap-1 rounded-lg px-2 py-2 text-xs ${
                c.id === activeId ? "bg-white/10 text-zinc-100" : "text-zinc-400 hover:bg-white/5"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                onDoubleClick={() => {
                  const next = prompt("Nuevo título:", c.title);
                  if (next) onRename(c.id, next);
                }}
                className="min-w-0 flex-1 truncate text-left"
                title={c.title}
              >
                {c.title || "Sin título"}
              </button>
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                className="shrink-0 text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                aria-label="Borrar"
              >
                ×
              </button>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3 text-[11px] text-zinc-600">
          Historial guardado solo en tu navegador.
        </div>
      </aside>
    </>
  );
}
