"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { TRILHAS_CONFIG } from "@/data/trilhas";

const ICONES: Record<string, string> = {
  "obras-rodoviarias":   "🛣️",
  "edificacoes":         "🏗️",
  "obras-hidricas":      "💧",
  "planejamento-normas": "📋",
};

const DESCRICOES: Record<string, string> = {
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
      minHeight: "100vh", background: "#0d1f33",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: "4px solid #1f3856", borderTopColor: "#5d2532",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );

  const primeiroNome = usuario.nome?.split(" ")[0] ?? "Concurseiro";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1f33",
      fontFamily: "'Montserrat', sans-serif",
      color: "#ffffff",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-materia {
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .card-materia:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 20px 48px rgba(0,0,0,0.5) !important;
        }
        .card-materia:active {
          transform: translateY(-2px) !important;
        }
        .btn-sair:hover {
          background: rgba(93,37,50,0.3) !important;
          color: #ffffff !important;
        }
      `}</style>

      {/* Top bar */}
      <div style={{
        background: "#091828",
        borderBottom: "2px solid #5d2532",
        padding: "14px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: "#5d2532",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>⚔️</div>
          <div>
            <div style={{
              fontSize: 16, fontWeight: 800, color: "#ffffff",
              letterSpacing: 1,
            }}>SENSEI DA APROVAÇÃO</div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: "#5d2532",
              letterSpacing: 2,
            }}>DESAFIO</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>
              {primeiroNome}
            </div>
            <div style={{ fontSize: 12, color: "#8aa8c4" }}>
              {usuario.email}
            </div>
          </div>
          <button
            className="btn-sair"
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "2px solid #5d2532",
              borderRadius: 8, padding: "8px 18px",
              fontSize: 13, fontWeight: 700,
              color: "#ffffff", cursor: "pointer",
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: 1,
              transition: "background 0.2s, color 0.2s",
            }}
          >
            SAIR
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{
        maxWidth: 760, margin: "0 auto",
        padding: "56px 24px 80px",
      }}>

        {/* Saudação */}
        <div style={{
          textAlign: "center", marginBottom: 56,
          animation: "fadeUp 0.5s ease",
        }}>
          <div style={{
            display: "inline-block",
            background: "rgba(93,37,50,0.25)",
            border: "2px solid #5d2532",
            borderRadius: 30, padding: "6px 22px",
            fontSize: 13, fontWeight: 700,
            color: "#ff8fa3", letterSpacing: 3,
            marginBottom: 20,
          }}>
            BEM-VINDO DE VOLTA
          </div>

          <h1 style={{
            fontSize: 44, fontWeight: 900,
            color: "#ffffff", lineHeight: 1.15,
            marginBottom: 16,
          }}>
            Olá, <span style={{ color: "#c0392b" }}>{primeiroNome}</span>!
          </h1>

          <p style={{
            fontSize: 18, fontWeight: 500,
            color: "#8aa8c4", lineHeight: 1.7,
            maxWidth: 500, margin: "0 auto",
          }}>
            Escolha a matéria que deseja estudar hoje.
            <br />Seu progresso é salvo automaticamente.
          </p>
        </div>

        {/* Grid de matérias */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 20,
        }}>
          {TRILHAS_CONFIG.map((trilha, i) => (
            <button
              key={trilha.id}
              className="card-materia"
              onClick={() => router.push(`/trilha?materia=${trilha.id}`)}
              style={{
                background: "#1f3856",
                border: "2px solid #2d5070",
                borderTop: `4px solid ${trilha.cor}`,
                borderRadius: 18,
                padding: "32px 28px",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
                animation: `fadeUp 0.5s ease ${i * 0.08}s both`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Kanji decorativo */}
              <div style={{
                position: "absolute", right: 16, bottom: 10,
                fontSize: 80, color: trilha.cor, opacity: 0.07,
                fontFamily: "serif", pointerEvents: "none",
                userSelect: "none", lineHeight: 1,
              }}>{trilha.kanji}</div>

              {/* Ícone */}
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: `${trilha.cor}33`,
                border: `2px solid ${trilha.cor}66`,
                display: "flex", alignItems: "center",
                justifyContent: "center",
                fontSize: 28, marginBottom: 20,
              }}>
                {ICONES[trilha.id]}
              </div>

              {/* Título */}
              <div style={{
                fontSize: 20, fontWeight: 800,
                color: "#ffffff", marginBottom: 10,
                lineHeight: 1.3,
              }}>
                {trilha.titulo}
              </div>

              {/* Descrição */}
              <div style={{
                fontSize: 14, fontWeight: 500,
                color: "#8aa8c4", lineHeight: 1.7,
                marginBottom: 24,
              }}>
                {DESCRICOES[trilha.id]}
              </div>

              {/* CTA */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: trilha.cor,
                borderRadius: 8, padding: "10px 20px",
                fontSize: 13, fontWeight: 800,
                color: "#ffffff", letterSpacing: 1,
              }}>
                ESTUDAR AGORA
                <span style={{ fontSize: 16 }}>→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Frase motivacional */}
        <div style={{
          marginTop: 56, textAlign: "center",
          padding: "24px 32px",
          background: "rgba(93,37,50,0.15)",
          border: "2px solid rgba(93,37,50,0.35)",
          borderRadius: 16,
          animation: "fadeUp 0.5s ease 0.4s both",
        }}>
          <div style={{
            fontSize: 16, fontWeight: 500,
            color: "#8aa8c4", lineHeight: 1.8,
            fontStyle: "italic",
          }}>
            "A disciplina é a ponte entre metas e conquistas."
          </div>
          <div style={{
            marginTop: 8, fontSize: 15, fontWeight: 800,
            color: "#c0392b", letterSpacing: 1,
          }}>
            CONTINUE TREINANDO, GUERREIRO.
          </div>
        </div>
      </div>
    </div>
  );
}