"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "./rng";
import type { PlanId } from "./plans";

export type Role = "u" | "a";
export type Message = { id: string; role: Role; text: string };
export type Conversation = { id: string; title: string; msgs: Message[] };
export type GeneratedImage = { id: string; url: string; prompt: string; style: string };

type State = {
  name: string;
  tone: "normal" | "breve" | "detallado";
  adsMode: "auto" | "off";
  plan: PlanId;
  usage: { day: string; msg: number; img: number };
  convs: Conversation[];
  current: string | null;
  images: GeneratedImage[];
  set: (patch: Partial<State>) => void;
  newConversation: () => string;
  addMessage: (convId: string, role: Role, text: string) => void;
  rollDay: () => void;
  useMsg: () => void;
  useImg: () => void;
  addImage: (img: GeneratedImage) => void;
};

const today = (): string => new Date().toDateString();

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      name: "Tú",
      tone: "normal",
      adsMode: "auto",
      plan: "gratis",
      usage: { day: today(), msg: 0, img: 0 },
      convs: [],
      current: null,
      images: [],
      set: (patch) => set(patch),
      newConversation: () => {
        const id = uid();
        set((s) => ({ convs: [{ id, title: "Nueva conversación", msgs: [] }, ...s.convs], current: id }));
        return id;
      },
      addMessage: (convId, role, text) =>
        set((s) => ({
          convs: s.convs.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  title: c.msgs.length === 0 && role === "u" ? text.slice(0, 38) : c.title,
                  msgs: [...c.msgs, { id: uid(), role, text }],
                }
              : c,
          ),
        })),
      rollDay: () => {
        if (get().usage.day !== today()) set({ usage: { day: today(), msg: 0, img: 0 } });
      },
      useMsg: () => set((s) => ({ usage: { ...s.usage, msg: s.usage.msg + 1 } })),
      useImg: () => set((s) => ({ usage: { ...s.usage, img: s.usage.img + 1 } })),
      addImage: (img) => set((s) => ({ images: [img, ...s.images].slice(0, 24) })),
    }),
    { name: "nexo-ai" },
  ),
);