export type PlanId = "gratis" | "plus" | "pro" | "max";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  msgs: number;
  imgs: number;
  ads: boolean;
  models: string[];
  perks: string[];
};

export const PLANS: Record<PlanId, Plan> = {
  gratis: {
    id: "gratis", name: "Gratis", price: 0, msgs: 15, imgs: 3, ads: true,
    models: ["nexo-ligero", "nexo-3"],
    perks: ["15 mensajes al día", "3 imágenes al día", "Con anuncios", "Modelos básicos"],
  },
  plus: {
    id: "plus", name: "Plus", price: 9, msgs: 300, imgs: 60, ads: false,
    models: ["nexo-ligero", "nexo-3", "nexo-3-pro"],
    perks: ["300 mensajes al día", "60 imágenes al día", "Sin anuncios", "Modelo pro"],
  },
  pro: {
    id: "pro", name: "Pro", price: 24, msgs: 2000, imgs: 400, ads: false,
    models: ["nexo-3", "nexo-3-pro", "nexo-razonador"],
    perks: ["2.000 mensajes al día", "400 imágenes al día", "Razonador", "Prioridad"],
  },
  max: {
    id: "max", name: "Max", price: 59, msgs: 99999, imgs: 9999, ads: false,
    models: ["nexo-3", "nexo-3-pro", "nexo-razonador"],
    perks: ["Mensajes ilimitados", "Imágenes ilimitadas", "Todo desbloqueado", "Exportación masiva"],
  },
};

export const MODELS = ["nexo-ligero", "nexo-3", "nexo-3-pro", "nexo-razonador"] as const;

export const ADS: { tag: string; body: string }[] = [
  { tag: "Hosting estático", body: "Deploy en 30 s · primer mes gratis" },
  { tag: "Curso de TypeScript", body: "Tipos sin dolor · 40 % de descuento hoy" },
  { tag: "Monitor 4K", body: "27 pulgadas 144 Hz · envío en 24 h" },
  { tag: "Café de origen", body: "Suscripción mensual · tostado el mismo día" },
];