import { INTENTS } from "./knowledge";

export function respond(prompt: string): string {
  const low = prompt.toLowerCase();
  for (const key of Object.keys(INTENTS)) {
    const intent = INTENTS[key];
    if (!intent) continue;
    if (intent.keys.some((k) => low.includes(k))) return intent.build(prompt);
  }
  return INTENTS.fallback!.build(prompt);
}

export function stream(text: string, onChunk: (partial: string) => void, speed = 4): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    const timer = setInterval(() => {
      i += speed + Math.floor(Math.random() * 4);
      onChunk(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, 14);
  });
}