"use client";
// src/app/questao/page.tsx
// Página de sessão de questões — o coração do aprendizado.
//
// Fluxo completo:
//   1. Recebe noId e materia via searchParams (vindo da trilha)
//   2. Busca as questões do banco local (src/data/questoes.ts)
//   3. Usuário responde uma por uma com feedback imediato
//   4. Ao finalizar, salva o progresso no Firestore e mostra o resultado
//   5. Botão "Voltar à trilha" retorna para /trilha e atualiza o progresso

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { salvarProgressoNo } from "@/lib/progresso";
import { buscarQuestoesPorNo } from "@/data/questoes";
import type { Questao } from "@/types";

// ── Tela de loading genérica ───────────────────────────────────────────────

function Loading() {
  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "3px solid #1e1e1e", borderTopColor: "#e8001e",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{
        color: "#333", fontSize: 11, letterSpacing: 4,
        fontFamily: "var(--font-main)", fontWeight: 700,
      }}>PREPARANDO QUESTÕES...</p>
    </div>
  );
}

// ── Tela de resultado final ────────────────────────────────────────────────

interface PropsResultado {
  acertos: number;
  total: number;
  estrelas: number;
  onVoltar: () => void;
  salvando: boolean;
}

function TelaResultado({ acertos, total, estrelas, onVoltar, salvando }: PropsResultado) {
  const pct = Math.round((acertos / total) * 100);

  // Escolhe a mensagem motivacional baseada no desempenho
  const mensagem =
    pct === 100 ? "PERFEITO! O dojô te honra, guerreiro." :
    pct >= 80   ? "EXCELENTE! Sua disciplina é admirável." :
    pct >= 60   ? "BOM TREINO! Continue forjando sua mente." :
    pct >= 40   ? "PERSISTÊNCIA! A derrota de hoje é o aprendizado de amanhã." :
                  "RECOMEÇAR é a marca dos grandes. Tente novamente.";

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", padding: "24px 20px", textAlign: "center",
      animation: "fadeIn 0.4s ease",
    }}>
      {/* Estrelas conquistadas */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            fontSize: 40,
            color: estrelas > i ? "#c9a84c" : "#1e1e1e",
            textShadow: estrelas > i ? "0 0 20px #c9a84c" : "none",
            filter: estrelas > i ? "drop-shadow(0 0 8px #c9a84c)" : "none",
            transition: `all 0.3s ease ${i * 0.15}s`,
          }}>★</span>
        ))}
      </div>

      {/* Porcentagem */}
      <div style={{
        fontSize: 72, fontWeight: 700, color: "#e8001e",
        fontFamily: "var(--font-main)", lineHeight: 1, marginBottom: 8,
        textShadow: "0 0 40px rgba(232,0,30,0.4)",
      }}>{pct}%</div>

      <div style={{
        fontSize: 14, color: "#5a5a5a", marginBottom: 4,
        fontFamily: "var(--font-main)", letterSpacing: 1,
      }}>
        {acertos} DE {total} QUESTÕES CORRETAS
      </div>

      {/* Mensagem motivacional */}
      <div style={{
        maxWidth: 320, padding: "16px 20px",
        background: "#111", border: "1px solid #1e1e1e",
        borderLeft: "3px solid #e8001e",
        borderRadius: 10, marginTop: 24, marginBottom: 32,
        fontSize: 14, color: "#888", lineHeight: 1.6,
        fontFamily: "var(--font-main)", letterSpacing: 0.5,
      }}>
        {mensagem}
      </div>

      <button
        onClick={onVoltar}
        disabled={salvando}
        style={{
          padding: "15px 32px",
          background: "#e8001e", border: "none",
          borderBottom: "4px solid #a50015",
          borderRadius: 8, cursor: salvando ? "wait" : "pointer",
          fontSize: 14, fontWeight: 700, color: "#fff",
          letterSpacing: 3, fontFamily: "var(--font-main)",
          opacity: salvando ? 0.6 : 1,
          boxShadow: "0 4px 24px rgba(232,0,30,0.4)",
        }}
      >
        {salvando ? "SALVANDO..." : "⚔️ VOLTAR À TRILHA"}
      </button>
    </div>
  );
}

// ── Componente principal (precisa de Suspense por causa do useSearchParams) ─

function QuestaoConteudo() {
  const router = useRouter();
  const params = useSearchParams();
  const { usuario, carregando: carregandoAuth } = useAuth();

  const noId     = params.get("noId") ?? "";
  const materia  = params.get("materia") ?? "";

  const [questoes, setQuestoes]           = useState<Questao[]>([]);
  const [indice, setIndice]               = useState(0);
  const [respostas, setRespostas]         = useState<(number | null)[]>([]);
  const [selecionada, setSelecionada]     = useState<number | null>(null);
  const [confirmada, setConfirmada]       = useState(false);
  const [finalizada, setFinalizada]       = useState(false);
  const [salvando, setSalvando]           = useState(false);
  const [carregando, setCarregando]       = useState(true);

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!carregandoAuth && !usuario) router.replace("/auth");
  }, [usuario, carregandoAuth, router]);

  // Carrega as questões do banco local
  useEffect(() => {
    if (!materia) return;
    const qs = buscarQuestoesPorNo(materia, 5);
    setQuestoes(qs);
    setRespostas(new Array(qs.length).fill(null));
    setCarregando(false);
  }, [materia]);

  const questaoAtual = questoes[indice];
  const acertos = respostas.filter((r, i) => r === questoes[i]?.gabarito).length;
  const estrelas = finalizada
    ? (acertos / questoes.length >= 0.9 ? 3 : acertos / questoes.length >= 0.75 ? 2 : acertos / questoes.length >= 0.5 ? 1 : 0)
    : 0;

  function confirmar() {
    if (selecionada === null) return;
    const novasRespostas = [...respostas];
    novasRespostas[indice] = selecionada;
    setRespostas(novasRespostas);
    setConfirmada(true);
  }

  function proxima() {
    if (indice + 1 >= questoes.length) {
      setFinalizada(true);
    } else {
      setIndice(i => i + 1);
      setSelecionada(null);
      setConfirmada(false);
    }
  }

  const voltar = useCallback(async () => {
    if (!usuario || !noId) { router.replace("/trilha"); return; }
    setSalvando(true);
    try {
      await salvarProgressoNo(usuario.uid, noId, acertos, questoes.length);
    } catch (e) {
      console.error("Erro ao salvar progresso:", e);
    } finally {
      router.replace("/trilha");
    }
  }, [usuario, noId, acertos, questoes.length, router]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (carregandoAuth || carregando) return <Loading />;

  // ── Tela final ───────────────────────────────────────────────────────────
  if (finalizada) {
    return (
      <TelaResultado
        acertos={acertos}
        total={questoes.length}
        estrelas={estrelas}
        onVoltar={voltar}
        salvando={salvando}
      />
    );
  }

  if (!questaoAtual) return <Loading />;

  const acertou = confirmada && selecionada === questaoAtual.gabarito;

  // ── Tela de questão ───────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      maxWidth: 480, margin: "0 auto",
      display: "flex", flexDirection: "column",
    }}>

      {/* Barra de progresso + fechar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#0a0a0acc", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a1a",
        padding: "12px 20px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button onClick={() => router.replace("/trilha")} style={{
          background: "none", border: "none",
          color: "#333", cursor: "pointer", fontSize: 18, padding: 0,
          lineHeight: 1, flexShrink: 0,
        }}>✕</button>

        {/* Barra de progresso da sessão */}
        <div style={{
          flex: 1, height: 8, background: "#1a1a1a",
          borderRadius: 99, overflow: "hidden",
        }}>
          <div style={{
            width: `${((indice) / questoes.length) * 100}%`,
            height: "100%",
            background: "linear-gradient(90deg, #e8001e, #e8001e88)",
            borderRadius: 99, transition: "width 0.4s ease",
          }} />
        </div>

        <span style={{
          fontSize: 12, color: "#333", fontWeight: 700,
          fontFamily: "var(--font-main)", letterSpacing: 1, flexShrink: 0,
        }}>
          {indice + 1}/{questoes.length}
        </span>
      </div>

      <div style={{ flex: 1, padding: "20px 20px 32px", animation: "fadeIn 0.3s ease" }}>

        {/* Tags da questão */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {[questaoAtual.banca, String(questaoAtual.ano)].map((tag) => (
            <span key={tag} style={{
              padding: "4px 10px", borderRadius: 4,
              background: "#111", border: "1px solid #1e1e1e",
              fontSize: 11, color: "#444",
              fontFamily: "var(--font-main)", letterSpacing: 2, fontWeight: 700,
            }}>{tag}</span>
          ))}
          <span style={{
            marginLeft: "auto", fontSize: 13,
            color: "#c9a84c44",
          }}>
            {"★".repeat(questaoAtual.dificuldade)}
          </span>
        </div>

        {/* Enunciado */}
        <div style={{
          background: "#111", border: "1px solid #1e1e1e",
          borderRadius: 12, padding: "18px 20px", marginBottom: 20,
          fontSize: 15, lineHeight: 1.75, color: "#d0ccc4",
          letterSpacing: 0.3,
        }}>
          {questaoAtual.enunciado}
        </div>

        {/* Alternativas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {questaoAtual.alternativas.map((alt, i) => {
            // Lógica de cor das alternativas após confirmação
            let bg = "#111";
            let borderColor = "#1e1e1e";
            let textColor = "#888";

            if (confirmada) {
              if (i === questaoAtual.gabarito) {
                bg = "rgba(34,197,94,0.1)"; borderColor = "#22c55e"; textColor = "#22c55e";
              } else if (i === selecionada && !acertou) {
                bg = "rgba(232,0,30,0.1)"; borderColor = "#e8001e"; textColor = "#e8001e88";
              }
            } else if (i === selecionada) {
              bg = "rgba(232,0,30,0.08)"; borderColor = "#e8001e44"; textColor = "#f0ece4";
            }

            return (
              <button key={i}
                onClick={() => !confirmada && setSelecionada(i)}
                style={{
                  background: bg, border: `2px solid ${borderColor}`,
                  borderRadius: 10, padding: "13px 16px",
                  cursor: confirmada ? "default" : "pointer",
                  textAlign: "left", color: textColor,
                  fontSize: 14, lineHeight: 1.6, letterSpacing: 0.3,
                  transition: "all 0.2s",
                  display: "flex", alignItems: "flex-start", gap: 12,
                  fontFamily: "var(--font-main)",
                }}
              >
                {/* Marcador da alternativa */}
                <span style={{
                  minWidth: 26, height: 26, borderRadius: 6,
                  background: `${borderColor}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: borderColor,
                  flexShrink: 0,
                }}>
                  {confirmada && i === questaoAtual.gabarito ? "✓"
                    : confirmada && i === selecionada && !acertou ? "✗"
                    : String.fromCharCode(65 + i)}
                </span>
                {alt}
              </button>
            );
          })}
        </div>

        {/* Explicação — aparece após confirmar */}
        {confirmada && (
          <div style={{
            background: acertou ? "rgba(34,197,94,0.08)" : "rgba(232,0,30,0.08)",
            border: `1px solid ${acertou ? "#22c55e44" : "#e8001e44"}`,
            borderRadius: 10, padding: "16px 18px", marginBottom: 20,
            animation: "fadeIn 0.3s ease",
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8,
              color: acertou ? "#22c55e" : "#e8001e",
              fontFamily: "var(--font-main)",
            }}>
              {acertou ? "✓ CORRETO — +10 XP" : "✗ INCORRETO"}
            </div>
            <div style={{
              fontSize: 14, color: "#888", lineHeight: 1.7, letterSpacing: 0.3,
            }}>
              {questaoAtual.explicacao}
            </div>
          </div>
        )}

        {/* Botão de ação */}
        {!confirmada ? (
          <button
            onClick={confirmar}
            disabled={selecionada === null}
            style={{
              width: "100%", padding: "15px",
              background: selecionada !== null ? "#e8001e" : "#111",
              border: `2px solid ${selecionada !== null ? "#e8001e" : "#1e1e1e"}`,
              borderBottom: selecionada !== null ? "4px solid #a50015" : "2px solid #1e1e1e",
              borderRadius: 8, cursor: selecionada !== null ? "pointer" : "not-allowed",
              fontSize: 14, fontWeight: 700, color: selecionada !== null ? "#fff" : "#333",
              letterSpacing: 3, fontFamily: "var(--font-main)",
              boxShadow: selecionada !== null ? "0 4px 20px rgba(232,0,30,0.3)" : "none",
              transition: "all 0.2s",
            }}
          >
            CONFIRMAR
          </button>
        ) : (
          <button
            onClick={proxima}
            style={{
              width: "100%", padding: "15px",
              background: "#e8001e", border: "none",
              borderBottom: "4px solid #a50015",
              borderRadius: 8, cursor: "pointer",
              fontSize: 14, fontWeight: 700, color: "#fff",
              letterSpacing: 3, fontFamily: "var(--font-main)",
              boxShadow: "0 4px 20px rgba(232,0,30,0.35)",
            }}
          >
            {indice + 1 >= questoes.length ? "VER RESULTADO" : "PRÓXIMA →"}
          </button>
        )}
      </div>
    </div>
  );
}

// Suspense é obrigatório quando useSearchParams é usado em Server/Client boundary do Next.js 14
export default function QuestaoPage() {
  return (
    <Suspense fallback={<Loading />}>
      <QuestaoConteudo />
    </Suspense>
  );
}
