"use client";

import { memo } from "react";
import type { Message } from "@/lib/types";
import Markdown from "./Markdown";

interface Props {
  message: Message;
  streaming: boolean;
  isLast: boolean;
  onRegenerate: () => void;
  onDelete: () => void;
}

function MessageView({ message, streaming, isLast, onRegenerate, onDelete }: Props) {
  const isUser = message.role === "user";

  return (
    <div className="group flex gap-3 px-4 py-5 md:px-8">
      <div
        className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md text-[11px] font-bold ${
          isUser ? "bg-zinc-700 text-zinc-100" : "bg-emerald-500/15 text-emerald-400"
        }`}
      >
        {isUser ? "TÚ" : "IA"}
      </div>

      <div className="min-w-0 flex-1">
        {message.attachments?.length ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {message.attachments.map((a) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={a.id}
                src={a.dataUrl}
                alt={a.name}
                className="h-28 w-28 rounded-lg border border-white/10 object-cover"
              />
            ))}
          </div>
        ) : null}

        {message.content ? (
          <div className={streaming && isLast ? "caret" : undefined}>
            <Markdown content={message.content} />
          </div>
        ) : streaming ? (
          <div className="caret text-zinc-500" />
        ) : null}

        {message.imageUrl ? (
          <div className="mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={message.imageUrl} alt="Imagen generada por IA" className="max-h-[640px] w-auto max-w-full rounded-2xl border border-white/10 object-contain" />
            <a href={message.imageUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5">
              Abrir imagen
            </a>
          </div>
        ) : null}

        {message.error ? (
          <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {message.content}
          </p>
        ) : null}

        {!streaming && message.content ? (
          <div className="mt-2 flex gap-3 text-[11px] text-zinc-500 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="hover:text-zinc-200"
            >
              Copiar
            </button>
            <button type="button" onClick={onRegenerate} className="hover:text-zinc-200">
              Regenerar
            </button>
            <button type="button" onClick={onDelete} className="hover:text-red-400">
              Borrar
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default memo(MessageView);
