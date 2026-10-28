export type Role = "user" | "assistant";

export interface Attachment {
  id: string;
  name: string;
  mime: string;
  dataUrl: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  imageUrl?: string;
  createdAt: number;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  context?: number;
}

export interface Settings {
  model: string;
  temperature: number;
  systemPrompt: string;
  webSearch: boolean;
}
