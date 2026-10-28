import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const KEY = process.env.OPENAI_API_KEY || "";

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
      { error: "El chat aún no está configurado. Añade OPENAI_API_KEY en las variables de entorno de Vercel." },
      { status: 503 },
    );
  }

  let body: {
    model?: string;
    messages?: IncomingMessage[];
    temperature?: number;
    systemPrompt?: string;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "La solicitud no contiene JSON válido." }, { status: 400 });
  }

  const { model, messages, temperature = 0.7, systemPrompt = "" } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No hay mensajes para responder." }, { status: 400 });
  }

  const payload = {
    model: model || "gpt-4.1-mini",
    stream: true,
    temperature: Math.min(2, Math.max(0, Number(temperature) || 0)),
    messages: [
      ...(systemPrompt.trim() ? [{ role: "system", content: systemPrompt.trim() }] : []),
      ...messages.map((m) => ({ role: m.role, content: toApiContent(m) })),
    ],
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
  } catch {
    return Response.json(
      { error: "No se ha podido conectar con el servicio de IA. Inténtalo de nuevo." },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    let message = "El servicio de IA no ha podido responder.";
    try {
      const parsed = JSON.parse(detail);
      const rawMessage = parsed?.error?.message;
      if (typeof rawMessage === "string") message = rawMessage;
    } catch {
      // Keep the friendly fallback instead of exposing provider HTML or internal details.
    }
    const status = upstream.status || 502;
    return Response.json({ error: message }, { status });
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
