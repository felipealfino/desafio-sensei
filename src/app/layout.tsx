// src/app/layout.tsx
// Layout raiz do Next.js 14 (App Router).
// Define metadados globais, importa fontes e aplica estilos base.
// Todos os outros layouts herdam desse.

import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";

// Rajdhani é a fonte do tema dojô — pesada, marcial, com personalidade forte.
// Usamos os pesos 400 (body), 600 (labels), 700 (títulos).
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Desafio Sensei",
  description: "Domine os concursos com a disciplina de um samurai.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={rajdhani.variable}>
      <body>{children}</body>
    </html>
  );
}
