import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "highlight.js/styles/github-dark.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Chat sin filtros",
  description: "Cliente de chat de IA sin filtros, streaming y modelos uncensored.",
};

export const viewport: Viewport = {
  themeColor: "#08080a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
