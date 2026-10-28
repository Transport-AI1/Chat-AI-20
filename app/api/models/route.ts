export const revalidate = 3600;

const BASE = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const KEY = process.env.OPENAI_API_KEY || "";

const FALLBACK = [
  { id: "gpt-4.1-mini", name: "GPT-4.1 mini", description: "Chat rápido para tareas cotidianas." },
  { id: "gpt-4.1", name: "GPT-4.1", description: "Análisis, escritura y programación." },
  { id: "o4-mini", name: "o4-mini", description: "Razonamiento y resolución de problemas." },
];

interface RawModel {
  id: string;
}

export async function GET() {
  if (!KEY) return Response.json({ models: FALLBACK });

  try {
    const res = await fetch(`${BASE}/models`, {
      headers: { Authorization: `Bearer ${KEY}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return Response.json({ models: FALLBACK });

    const data = (await res.json()) as { data?: RawModel[] };
    const available = new Set((data.data ?? []).map((m) => m.id));
    const models = FALLBACK.filter((model) => available.has(model.id));
    return Response.json({ models: models.length ? models : FALLBACK });
  } catch {
    return Response.json({ models: FALLBACK });
  }
}
