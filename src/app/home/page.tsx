"use client";
// src/app/home/page.tsx
// Tela de seleção de matéria — aparece logo após o login.
// O usuário escolhe qual matéria quer estudar e vai direto para a trilha.

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { TRILHAS_CONFIG } from "@/data/trilhas";

const ICONES_MATERIAS: Record<string, string> = {
  "obras-rodoviarias":   "🛣️",
  "edificacoes":         "🏗️",
  "obras-hidricas":      "💧",
  "planejamento-normas": "📋",
};

const DESCRICOES_MATERIAS: Record<string, string> = {
  "obras-rodoviarias":   "Pavimentação, terraplenagem, drenagem e sinalização",
  "edificacoes":         "Estruturas, fundações, instalações e acabamentos",
  "obras-hidricas":      "Hidráulica, saneamento, barragens e irrigação",
  "planejamento-normas": "Gestão de obras, normas técnicas e legislação",
};

export default function HomePage() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !usuario) router.replace("/auth");
  }, [usuario, carregando, router]);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/auth");
  }

  if (carregando || !usuario) return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1f33",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "3px solid #1f3856",
        borderTopColor: "#5d2532",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );

  const primeiroNome = usuario.nome?.split(" ")[0] ?? "Concurseiro";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0d1f33 0%, #1f3856 60%, #0d1f33 100%)",
      fontFamily: "'Rajdhani', sans-serif",
      color: "#f0ece4",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(93,37,50,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(93,37,50,0); }
        }
        .materia-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4) !important;
        }
        .materia-card:active {
          transform: translateY(-1px) !important;
        }
        .logout-btn:hover { color: #5d2532 !important; }
      `}</style>

      {/* Top bar */}
      <div style={{
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(13,31,51,0.8)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "#5d2532",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 0 16px rgba(93,37,50,0.5)",
          }}>⚔️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "#f0ece4" }}>
              SENSEI DA APROVAÇÃO
            </div>
            <div style={{ fontSize: 10, color: "#5d2532", letterSpacing: 3, fontWeight: 600 }}>
              DESAFIO
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "#f0ece4", fontWeight: 600 }}>{primeiroNome}</div>
            <div style={{ fontSize: 10, color: "#4a6580", letterSpacing: 1 }}>{usuario.email}</div>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "6px 14px",
              fontSize: 11, color: "#4a6580",
              cursor: "pointer", letterSpacing: 2,
              fontFamily: "'Rajdhani', sans-serif",
              transition: "color 0.2s",
            }}
          >
            SAIR
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={{
        maxWidth: 680, margin: "0 auto",
        padding: "48px 24px 64px",
        animation: "fadeUp 0.5s ease",
      }}>
        {/* Saudação */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-block",
            background: "rgba(93,37,50,0.2)",
            border: "1px solid rgba(93,37,50,0.4)",
            borderRadius: 20, padding: "4px 16px",
            fontSize: 11, color: "#5d2532",
            letterSpacing: 3, fontWeight: 700,
            marginBottom: 16,
          }}>
            BEM-VINDO DE VOLTA
          </div>
          <h1 style={{
            fontSize: 36, fontWeight: 700, letterSpacing: 1,
            color: "#f0ece4", lineHeight: 1.2, marginBottom: 12,
          }}>
            Olá, <span style={{ color: "#5d2532" }}>{primeiroNome}</span>!
          </h1>
          <p style={{
            fontSize: 16, color: "#4a6580", letterSpacing: 0.5, lineHeight: 1.6,
          }}>
            Escolha a matéria que deseja estudar hoje.<br />
            Seu progresso é salvo automaticamente em cada trilha.
          </p>
        </div>

        {/* Grid de matérias */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
        }}>
          {TRILHAS_CONFIG.map((trilha, i) => (
            <button
              key={trilha.id}
              className="materia-card"
              onClick={() => router.push(`/trilha?materia=${trilha.id}`)}
              style={{
                background: "rgba(31,56,86,0.4)",
                border: `1px solid rgba(255,255,255,0.08)`,
                borderTop: `3px solid ${trilha.cor}`,
                borderRadius: 16,
                padding: "28px 24px",
                cursor: "pointer",
                textAlign: "left",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                animation: `fadeUp 0.5s ease ${i * 0.1}s both`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Kanji decorativo de fundo */}
              <div style={{
                position: "absolute", right: 12, bottom: 8,
                fontSize: 64, color: trilha.cor, opacity: 0.08,
                fontFamily: "serif", pointerEvents: "none",
                userSelect: "none", lineHeight: 1,
              }}>{trilha.kanji}</div>

              {/* Ícone */}
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${trilha.cor}22`,
                border: `1px solid ${trilha.cor}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, marginBottom: 16,
              }}>
                {ICONES_MATERIAS[trilha.id]}
              </div>

              {/* Título */}
              <div style={{
                fontSize: 17, fontWeight: 700, color: "#f0ece4",
                letterSpacing: 0.5, marginBottom: 8, lineHeight: 1.3,
              }}>
                {trilha.titulo}
              </div>

              {/* Descrição */}
              <div style={{
                fontSize: 12, color: "#4a6580", lineHeight: 1.6, letterSpacing: 0.3,
              }}>
                {DESCRICOES_MATERIAS[trilha.id]}
              </div>

              {/* Seta */}
              <div style={{
                marginTop: 20,
                fontSize: 12, color: trilha.cor,
                letterSpacing: 2, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                ESTUDAR AGORA
                <span style={{ fontSize: 14 }}>→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Rodapé motivacional */}
        <div style={{
          marginTop: 48, textAlign: "center",
          padding: "20px 24px",
          background: "rgba(93,37,50,0.1)",
          border: "1px solid rgba(93,37,50,0.2)",
          borderRadius: 14,
        }}>
          <div style={{ fontSize: 13, color: "#4a6580", letterSpacing: 1, lineHeight: 1.8 }}>
            "A disciplina é a ponte entre metas e conquistas."
            <br />
            <span style={{ color: "#5d2532", fontWeight: 700 }}>Continue treinando, guerreiro.</span>
          </div>
        </div>
      </div>
    </div>
  );
}