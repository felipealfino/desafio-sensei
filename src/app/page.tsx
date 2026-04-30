"use client";
// src/app/page.tsx
// Porteiro da aplicação: redireciona o usuário para a página certa.
// Se estiver logado → trilha. Se não estiver → auth.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;
    router.replace(usuario ? "/trilha" : "/auth");
  }, [usuario, carregando, router]);

  // Tela de loading enquanto o Firebase verifica a sessão
  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: "3px solid #1e1e1e", borderTopColor: "#e8001e",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{
        color: "#333", fontSize: 11, letterSpacing: 4,
        fontFamily: "var(--font-main)", fontWeight: 700,
      }}>
        CARREGANDO...
      </p>
    </div>
  );
}
