import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const BASE = (process.env.API_BASE_URL || "https://api.venice.ai/api/v1").replace(/\/+$/, "");
const KEY = process.env.API_KEY || process.env.VENICE_API_KEY || "";

export async function POST(req: NextRequest) {
  if (!KEY) {
    return Response.json({ error: "Falta API_KEY en las variables de entorno de Vercel." }, { status: 500 });
  }

  let body: { prompt?: string; size?: string; model?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "La solicitud no contiene JSON válido." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt || prompt.length > 1500) {
    return Response.json({ error: "Escribe una descripción de imagen de entre 1 y 1500 caracteres." }, { status: 400 });
  }

  const allowedSizes = new Set(["1024x1024", "1536x1024", "1024x1536", "512x512", "1024x1792", "1792x1024"]);
  const size = allowedSizes.has(body.size || "") ? body.size : "1024x1024";

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
      },
      body: JSON.stringify({
        prompt,
        model: body.model || "z-image-turbo",
        n: 1,
        size,
        response_format: "b64_json",
        output_format: "png",
        moderation: "auto",
      }),
      signal: AbortSignal.timeout(110_000),
    });
  } catch {
    return Response.json({ error: "No se pudo conectar con el servicio de generación de imágenes. Inténtalo de nuevo." }, { status: 502 });
  }

  const raw = await upstream.text();
  let data: { data?: Array<{ b64_json?: string; url?: string }>; error?: string | { message?: string } };
  try {
    data = JSON.parse(raw);
  } catch {
    return Response.json({ error: raw.slice(0, 500) || `Error del proveedor (${upstream.status}).` }, { status: upstream.status || 502 });
  }

  if (!upstream.ok) {
    const detail = typeof data.error === "string" ? data.error : data.error?.message;
    const message = upstream.status === 402
      ? "El servicio de IA no tiene saldo suficiente para generar la imagen. Revisa la configuración de facturación del proveedor."
      : detail || `El proveedor ha devuelto el error ${upstream.status}.`;
    return Response.json({ error: message }, { status: upstream.status });
  }

  const first = data.data?.[0];
  if (first?.b64_json) {
    return Response.json({ imageUrl: `data:image/png;base64,${first.b64_json}` });
  }
  if (first?.url) return Response.json({ imageUrl: first.url });
  return Response.json({ error: "El proveedor no ha devuelto ninguna imagen." }, { status: 502 });
}
