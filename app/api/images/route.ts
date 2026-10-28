import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const BASE = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const KEY = process.env.OPENAI_API_KEY || "";

export async function POST(req: NextRequest) {
  if (!KEY) {
    return Response.json({ error: "La generación de imágenes aún no está configurada. Añade OPENAI_API_KEY en Vercel." }, { status: 503 });
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

  const allowedSizes = new Set(["1024x1024", "1536x1024", "1024x1536"]);
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
        model: body.model || "gpt-image-1",
        prompt,
        n: 1,
        size,
      }),
      signal: AbortSignal.timeout(110_000),
    });
  } catch {
    return Response.json({ error: "No se ha podido conectar con el servicio de generación de imágenes." }, { status: 502 });
  }

  const raw = await upstream.text();
  let data: { data?: Array<{ b64_json?: string; url?: string }>; error?: string | { message?: string } };
  try {
    data = JSON.parse(raw);
  } catch {
    return Response.json({ error: "El servicio de imágenes ha devuelto una respuesta no válida." }, { status: upstream.status || 502 });
  }

  if (!upstream.ok) {
    const detail = typeof data.error === "string" ? data.error : data.error?.message;
    return Response.json({ error: detail || "No se ha podido generar la imagen. Comprueba la clave y la facturación de la API." }, { status: upstream.status });
  }

  const first = data.data?.[0];
  if (first?.b64_json) return Response.json({ imageUrl: `data:image/png;base64,${first.b64_json}` });
  if (first?.url) return Response.json({ imageUrl: first.url });
  return Response.json({ error: "El servicio no ha devuelto ninguna imagen." }, { status: 502 });
}
