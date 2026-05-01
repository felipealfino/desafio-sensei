"use client";
// src/app/page.tsx
// Porteiro: redireciona para /auth ou /home dependendo do login.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;
    router.replace(usuario ? "/home" : "/auth");
  }, [usuario, carregando, router]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0d1f33 0%, #1f3856 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: "3px solid #1f3856",
        borderTopColor: "#5d2532",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}