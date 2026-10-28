export const revalidate = 3600;

const BASE = (process.env.API_BASE_URL || "https://api.venice.ai/api/v1").replace(/\/+$/, "");
const KEY = process.env.API_KEY || process.env.VENICE_API_KEY || "";

const FALLBACK = [
  { id: "llama-3.3-70b", name: "Asistente general", description: "Ayuda para tareas, ideas y redacción." },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", description: "Razonamiento y redacción." },
  { id: "qwen3-235b-a22b", name: "Qwen3 235B", description: "Contexto largo y código." },
  { id: "deepseek-v3.1", name: "DeepSeek V3.1", description: "Código y análisis." },
];

interface RawModel {
  id: string;
  model_spec?: {
    name?: string;
    description?: string;
    availableContextTokens?: number;
  };
}

export async function GET() {
  if (!KEY) return Response.json({ models: FALLBACK });

  try {
    const res = await fetch(`${BASE}/models?type=text`, {
      headers: { Authorization: `Bearer ${KEY}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return Response.json({ models: FALLBACK });

    const data = (await res.json()) as { data?: RawModel[] };
    const models = (data.data ?? [])
      .filter((m) => m?.id)
      .map((m) => ({
        id: m.id,
        name: m.model_spec?.name ?? m.id,
        description: m.model_spec?.description ?? "",
        context: m.model_spec?.availableContextTokens ?? 0,
      }));

    return Response.json({ models: models.length ? models : FALLBACK });
  } catch {
    return Response.json({ models: FALLBACK });
  }
}
