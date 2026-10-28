"use client";

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import type { Attachment } from "@/lib/types";
import { uid } from "@/lib/uid";

interface Props {
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
  streaming: boolean;
  disabled: boolean;
}

const MAX_FILE_BYTES = 8 * 1024 * 1024;

export default function Composer({ onSend, onStop, streaming, disabled }: Props) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  async function readFiles(list: FileList | File[]) {
    const accepted = Array.from(list).filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_FILE_BYTES,
    );
    const next = await Promise.all(
      accepted.map(
        (file) =>
          new Promise<Attachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({ id: uid(), name: file.name, mime: file.type, dataUrl: String(reader.result) });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    );
    setFiles((prev) => [...prev, ...next].slice(0, 6));
  }

  function submit() {
    const trimmed = text.trim();
    if (streaming || disabled) return;
    if (!trimmed && files.length === 0) return;
    onSend(trimmed, files);
    setText("");
    setFiles([]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div
      className="sticky bottom-0 bg-gradient-to-t from-[#08080a] via-[#08080a] to-transparent px-4 pb-4 pt-6 md:px-8"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void readFiles(e.dataTransfer.files);
      }}
    >
      <div
        className={`mx-auto max-w-3xl rounded-2xl border bg-[#101014] p-2 transition ${
          dragging ? "border-emerald-500/60" : "border-white/10"
        }`}
      >
        {files.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-1">
            {files.map((f) => (
              <div key={f.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.dataUrl} alt={f.name} className="h-16 w-16 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                  className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-black text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex items-end gap-1">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Adjuntar imagen"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
          >
            +
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.files) void readFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <textarea
            ref={ref}
            rows={1}
            value={text}
            disabled={disabled}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={disabled ? "Configura tu API_KEY para empezar…" : "Escribe lo que quieras…"}
            className="max-h-64 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />

          {streaming ? (
            <button
              type="button"
              onClick={onStop}
              className="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-700 text-white hover:bg-zinc-600"
              title="Detener"
            >
              ■
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={disabled || (!text.trim() && files.length === 0)}
              className="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600"
              title="Enviar"
            >
              ↑
            </button>
          )}
        </div>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-zinc-600">
        Enter envía · Shift+Enter salto de línea · Puedes arrastrar imágenes
      </p>
    </div>
  );
}
