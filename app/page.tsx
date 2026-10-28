"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Attachment, Conversation, Message, Settings } from "@/lib/types";
import Link from "next/link";
import { DEFAULT_SETTINGS, loadState, saveState } from "@/lib/storage";
import { uid } from "@/lib/uid";
import Composer from "@/components/Composer";
import MessageView from "@/components/Message";
import ModelPicker from "@/components/ModelPicker";
import SettingsPanel from "@/components/SettingsPanel";
import Sidebar from "@/components/Sidebar";

function makeConversation(settings: Settings): Conversation {
  const now = Date.now();
  return {
    id: uid(),
    title: "Nueva conversación",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [streaming, setStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollLock = useRef(true);

  // Hidratar desde localStorage
  useEffect(() => {
    const state = loadState();
    setConversations(state.conversations);
    setSettings(state.settings);
    if (state.conversations.length > 0) {
      setActiveId(state.activeId ?? state.conversations[0].id);
    } else {
      const fresh = makeConversation(state.settings);
      setConversations([fresh]);
      setActiveId(fresh.id);
    }
    setHydrated(true);
  }, []);

  // Persistir
  useEffect(() => {
    if (!hydrated) return;
    saveState({ conversations, settings, activeId });
  }, [conversations, settings, activeId, hydrated]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const patchConversation = useCallback(
    (id: string, fn: (c: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
    },
    [],
  );

  // Autoscroll
  useEffect(() => {
    if (!scrollLock.current) return;
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [active?.messages]);

  function newConversation() {
    const fresh = makeConversation(settings);
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    setSidebarOpen(false);
  }

  function deleteConversation(id: string) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const fresh = makeConversation(settings);
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  }

  const stream = useCallback(
    async (conversationId: string, history: Message[], model: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setStreaming(true);

      const assistantId = uid();
      patchConversation(conversationId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          { id: assistantId, role: "assistant", content: "", createdAt: Date.now() },
        ],
        updatedAt: Date.now(),
      }));

      const append = (piece: string) => {
        patchConversation(conversationId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + piece } : m,
          ),
        }));
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            temperature: settings.temperature,
            systemPrompt: settings.systemPrompt,
            webSearch: settings.webSearch,
            messages: history.map((m) => ({
              role: m.role,
              content: m.content,
              attachments: m.attachments?.map((a) => ({ dataUrl: a.dataUrl })),
            })),
          }),
        });

        if (!res.ok || !res.body) {
          const detail = await res.text().catch(() => "");
          let msg = `Error ${res.status}`;
          try {
            msg = (JSON.parse(detail) as { error?: string }).error ?? msg;
          } catch {
            if (detail) msg = detail.slice(0, 400);
          }
          throw new Error(msg);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const piece = json.choices?.[0]?.delta?.content;
              if (typeof piece === "string" && piece) append(piece);
            } catch {
              /* fragmento parcial */
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // nada: se conserva lo recibido
        } else {
          patchConversation(conversationId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantId
                ? { ...m, error: true, content: (err as Error).message || "Fallo de red." }
                : m,
            ),
          }));
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
        patchConversation(conversationId, (c) => ({
          ...c,
          messages: c.messages.filter((m) => m.id !== assistantId || m.content || m.error),
        }));
      }
    },
    [patchConversation, settings],
  );

  function send(text: string, attachments: Attachment[], mode: "chat" | "image" = "chat") {
    if (!active) return;
    const message: Message = {
      id: uid(),
      role: "user",
      content: text,
      attachments: attachments.length ? attachments : undefined,
      createdAt: Date.now(),
    };

    const history = [...active.messages, message];

    patchConversation(active.id, (c) => ({
      ...c,
      title: c.messages.length === 0 ? text.slice(0, 48) || "Imagen" : c.title,
      messages: history,
      updatedAt: Date.now(),
    }));

    scrollLock.current = true;
    if (mode === "image") {
      void generateImage(active.id, text);
      return;
    }
    void stream(active.id, history, settings.model);
  }

  async function generateImage(conversationId: string, prompt: string) {
    if (!prompt.trim() || streaming) return;
    const assistantId = uid();
    setStreaming(true);
    patchConversation(conversationId, (c) => ({
      ...c,
      messages: [...c.messages, {
        id: assistantId,
        role: "assistant",
        content: "Generando imagen…",
        createdAt: Date.now(),
      }],
      updatedAt: Date.now(),
    }));
    try {
      const response = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), size: "1024x1024" }),
      });
      const result = await response.json() as { imageUrl?: string; error?: string };
      if (!response.ok || !result.imageUrl) {
        throw new Error(result.error || "No se pudo generar la imagen.");
      }
      patchConversation(conversationId, (c) => ({
        ...c,
        messages: c.messages.map((m) => m.id === assistantId
          ? { ...m, content: "Aquí tienes la imagen que has pedido.", imageUrl: result.imageUrl }
          : m),
        updatedAt: Date.now(),
      }));
    } catch (err) {
      patchConversation(conversationId, (c) => ({
        ...c,
        messages: c.messages.map((m) => m.id === assistantId
          ? { ...m, content: (err as Error).message || "Error al generar la imagen.", error: true }
          : m),
      }));
    } finally {
      setStreaming(false);
    }
  }

  function regenerate() {
    if (!active || streaming) return;
    const lastUserIndex = [...active.messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIndex === -1) return;
    const cut = active.messages.length - lastUserIndex;
    const history = active.messages.slice(0, cut);
    patchConversation(active.id, (c) => ({ ...c, messages: history }));
    void stream(active.id, history, settings.model);
  }

  function deleteMessage(id: string) {
    if (!active) return;
    patchConversation(active.id, (c) => ({
      ...c,
      messages: c.messages.filter((m) => m.id !== id),
    }));
  }

  function exportChat() {
    if (!active) return;
    const md = active.messages
      .map((m) => `## ${m.role === "user" ? "Usuario" : "Asistente"}\n\n${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([`# ${active.title}\n\n${md}\n`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.title.slice(0, 40).replace(/\W+/g, "-") || "chat"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onNew={newConversation}
        onDelete={deleteConversation}
        onRename={(id, title) => patchConversation(id, (c) => ({ ...c, title }))}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 md:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 md:hidden"
            aria-label="Menú"
          >
            ☰
          </button>

          <ModelPicker
            value={settings.model}
            onChange={(model) => setSettings((s) => ({ ...s, model }))}
          />

          <div className="ml-auto flex items-center gap-2 text-xs">
            <Link href="/planes" className="rounded-lg border border-white/10 px-2 py-1.5 text-zinc-400 hover:text-zinc-200">Planes</Link>
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className={`rounded-lg border px-2 py-1.5 ${
                showSettings
                  ? "border-emerald-600/60 text-emerald-400"
                  : "border-white/10 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Ajustes
            </button>
            <button
              type="button"
              onClick={exportChat}
              className="rounded-lg border border-white/10 px-2 py-1.5 text-zinc-400 hover:text-zinc-200"
            >
              Exportar
            </button>
          </div>
        </header>

        {showSettings ? (
          <SettingsPanel
            settings={settings}
            onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
          />
        ) : null}

        <div
          className="flex-1 overflow-y-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            scrollLock.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          }}
        >
          {!active || active.messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col justify-center px-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                Pregunta lo que sea
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Sin filtros, sin advertencias. Modelos uncensored, streaming, imágenes y código.
              </p>
              <div className="mt-6 grid gap-2 text-left sm:grid-cols-2">
                {[
                  "Explícame la teoría de cuerdas como si tuviera 12 años",
                  "Escribe un scraper en Python con reintentos y backoff",
                  "¿Qué opinas de la deuda pública como política económica?",
                  "Analiza esta imagen y dime qué ves",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s, [])}
                    className="rounded-xl border border-white/10 bg-[#101014] px-3 py-3 text-left text-xs text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl pb-4">
              {active.messages.map((m, i) => (
                <MessageView
                  key={m.id}
                  message={m}
                  streaming={streaming && i === active.messages.length - 1}
                  isLast={i === active.messages.length - 1}
                  onRegenerate={regenerate}
                  onDelete={() => deleteMessage(m.id)}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <Composer
          onSend={send}
          onStop={() => abortRef.current?.abort()}
          streaming={streaming}
          disabled={!active}
        />
      </main>
    </div>
  );
}
