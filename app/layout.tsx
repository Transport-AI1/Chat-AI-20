import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nexo.ai — chat local",
  description: "Chat con IA, imágenes y planes. Sin API.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="h-screen overflow-hidden text-zinc-100 antialiased">{children}</body>
    </html>
  );
}