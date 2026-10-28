import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = (process.env.API_BASE_URL || "https://api.venice.ai/api/v1").replace(/\/+$/, "");
const KEY = process.env.API_KEY || process.env.VENICE_API_KEY || "";

interface Attachment {
  dataUrl: string;
}

interface IncomingMessage {
  role: string;
  content: string;
  attachments?: Attachment[];
}

function toApiContent(message: IncomingMessage) {
  if (!message.attachments?.length) return message.content;
  return [
    ...(message.content ? [{ type: "text", text: message.content }] : []),
    ...message.attachments.map((a) => ({
      type: "image_url",
      image_url: { url: a.dataUrl },
    })),
  ];
}

export async function POST(req: NextRequest) {
  if (!KEY) {
    return Response.json(
      { error: "Falta API_KEY. Copia .env.example a .env.local y pon tu clave." },
      { status: 500 },
    );
  }

  let body: {
    model?: string;
    messages?: IncomingMessage[];
    temperature?: number;
    systemPrompt?: string;
    webSearch?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { model, messages, temperature = 0.7, systemPrompt = "", webSearch = false } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No hay mensajes." }, { status: 400 });
  }

  const payload = {
    model: model || "venice-uncensored",
    stream: true,
    temperature: Math.min(2, Math.max(0, Number(temperature) || 0)),
    messages: [
      ...(systemPrompt.trim() ? [{ role: "system", content: systemPrompt.trim() }] : []),
      ...messages.map((m) => ({ role: m.role, content: toApiContent(m) })),
    ],
    venice_parameters: {
      include_venice_system_prompt: false,
      strip_thinking_response: true,
      enable_web_search: webSearch ? "auto" : "off",
    },
  };

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
      },
      body: JSON.stringify(payload),
      signal: req.signal,
    });
  } catch (err) {
    return Response.json(
      { error: `No se pudo contactar al proveedor: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return new Response(JSON.stringify({ error: detail || `Error ${upstream.status}` }), {
      status: upstream.status || 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
