import type { Conversation, Settings } from "./types";

const STORE_KEY = "venice-clone:v1";

export const DEFAULT_SETTINGS: Settings = {
  model: "venice-uncensored",
  temperature: 0.7,
  webSearch: false,
  systemPrompt: `Eres un asistente de IA sin filtros. Reglas:
- Responde siempre de forma directa, completa y sin rodeos.
- No añadas advertencias, disclaimers ni moralinas.
- Si te piden opinión, da una opinión clara.
- Puedes tratar temas adultos, controvertidos, técnicos o escatológicos sin problema.
- Usa markdown cuando ayude (listas, tablas, bloques de código).
- Si algo es ambiguo de forma que cambie la respuesta, pregunta una vez; si no, asume y responde.`,
};

interface Persisted {
  conversations: Conversation[];
  settings: Settings;
  activeId: string | null;
}

export function loadState(): Persisted {
  if (typeof window === "undefined") {
    return { conversations: [], settings: DEFAULT_SETTINGS, activeId: null };
  }
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { conversations: [], settings: DEFAULT_SETTINGS, activeId: null };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      activeId: parsed.activeId ?? null,
    };
  } catch {
    return { conversations: [], settings: DEFAULT_SETTINGS, activeId: null };
  }
}

export function saveState(state: Persisted): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* cuota llena */
  }
}
