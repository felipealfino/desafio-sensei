"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { salvarProgressoNo } from "@/lib/progresso";
import { buscarQuestoesPorMateria } from "@/lib/questoes"; // ← Firestore
import type { Questao } from "@/types";

function Loading({ mensagem = "PREPARANDO QUESTÕES..." }: { mensagem?: string }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "4px solid #e2e8f0", borderTopColor: "#5d2532",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{
        color: "#94a3b8", fontSize: 11, letterSpacing: 4,
        fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
      }}>{mensagem}</p>
    </div>
  );
}

function SemQuestoes({ materia, onVoltar }: { materia: string; onVoltar: () => void }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16, padding: "0 24px", textAlign: "center",
      fontFamily: "'Montserrat', sans-serif",
    }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <p style={{ color: "#1f3856", fontSize: 18, fontWeight: 800 }}>
        Sem questões disponíveis
      </p>
      <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7 }}>
        Não encontramos questões para <strong style={{ color: "#5d2532" }}>{materia}</strong>.
        <br />Importe questões via <strong>/migrar</strong> antes de continuar.
      </p>
      <button onClick={onVoltar} style={{
        padding: "12px 24px", background: "#5d2532",
        border: "none", borderBottom: "3px solid #3d1520",
        borderRadius: 8, cursor: "pointer",
        fontSize: 13, fontWeight: 800, color: "#fff",
        letterSpacing: 2, fontFamily: "'Montserrat', sans-serif",
      }}>
        VOLTAR À TRILHA
      </button>
    </div>
  );
}

function TelaResultado({ acertos, total, estrelas, onVoltar, salvando }: {
  acertos: number; total: number; estrelas: number;
  onVoltar: () => void; salvando: boolean;
}) {
  const pct = Math.round((acertos / total) * 100);
  const atingiuMinimo = acertos / total >= 0.8;

  const mensagem =
    pct === 100  ? "PERFEITO! Nó concluído com 3 estrelas! 🏆" :
    pct >= 80    ? "APROVADO! Você concluiu este nó! ✅ Próximo desbloqueado." :
    pct >= 60    ? "QUASE LÁ! Você precisa de 80% para concluir. Tente novamente! 💪" :
    pct >= 40    ? "CONTINUE TREINANDO! Refaça este nó para avançar. 📚" :
                   "NÃO DESISTA! A persistência leva à aprovação. Tente de novo! ⚔️";

  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", padding: "24px 20px", textAlign: "center",
      fontFamily: "'Montserrat', sans-serif",
    }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Estrelas */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            fontSize: 44,
            color: estrelas > i ? "#f59e0b" : "#e2e8f0",
            textShadow: estrelas > i ? "0 0 16px #f59e0b88" : "none",
            transition: `all 0.3s ease ${i * 0.15}s`,
          }}>★</span>
        ))}
      </div>

      {/* Porcentagem */}
      <div style={{
        fontSize: 80, fontWeight: 900,
        color: atingiuMinimo ? "#5d2532" : "#1f3856",
        lineHeight: 1, marginBottom: 8,
      }}>{pct}%</div>

      <div style={{ fontSize: 15, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>
        {acertos} DE {total} QUESTÕES CORRETAS
      </div>

      {/* Badge aprovado/reprovado */}
      <div style={{
        display: "inline-block",
        background: atingiuMinimo ? "rgba(93,37,50,0.1)" : "rgba(31,56,86,0.1)",
        border: `2px solid ${atingiuMinimo ? "#5d2532" : "#1f3856"}44`,
        borderRadius: 20, padding: "4px 20px",
        fontSize: 12, fontWeight: 800,
        color: atingiuMinimo ? "#5d2532" : "#1f3856",
        letterSpacing: 2, marginBottom: 24,
      }}>
        {atingiuMinimo ? "✅ NÓ CONCLUÍDO" : "❌ TENTE NOVAMENTE"}
      </div>

      {/* Mensagem */}
      <div style={{
        maxWidth: 340, padding: "18px 22px",
        background: "#ffffff", border: "1px solid #e2e8f0",
        borderLeft: `4px solid ${atingiuMinimo ? "#5d2532" : "#1f3856"}`,
        borderRadius: 12, marginBottom: 32,
        fontSize: 14, fontWeight: 500, color: "#475569",
        lineHeight: 1.7,
      }}>
        {mensagem}
      </div>

      <button onClick={onVoltar} disabled={salvando} style={{
        padding: "16px 36px",
        background: "#5d2532", border: "none",
        borderBottom: "4px solid #3d1520",
        borderRadius: 10, cursor: salvando ? "wait" : "pointer",
        fontSize: 15, fontWeight: 800, color: "#fff",
        letterSpacing: 2, opacity: salvando ? 0.6 : 1,
        boxShadow: "0 6px 24px rgba(93,37,50,0.35)",
        fontFamily: "'Montserrat', sans-serif",
      }}>
        {salvando ? "SALVANDO..." : "← VOLTAR À TRILHA"}
      </button>
    </div>
  );
}

function QuestaoConteudo() {
  const router = useRouter();
  const params = useSearchParams();
  const { usuario, carregando: carregandoAuth } = useAuth();

  const noId    = params.get("noId") ?? "";
  const materia = params.get("materia") ?? "";

  const [questoes, setQuestoes]       = useState<Questao[]>([]);
  const [indice, setIndice]           = useState(0);
  const [respostas, setRespostas]     = useState<(number | null)[]>([]);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [confirmada, setConfirmada]   = useState(false);
  const [finalizada, setFinalizada]   = useState(false);
  const [salvando, setSalvando]       = useState(false);
  const [carregando, setCarregando]   = useState(true);
  const [semQuestoes, setSemQuestoes] = useState(false);

  useEffect(() => {
    if (!carregandoAuth && !usuario) router.replace("/auth");
  }, [usuario, carregandoAuth, router]);

  // Busca questões no Firestore
  useEffect(() => {
    if (!materia || !usuario) return;
    async function carregar() {
      setCarregando(true);
      try {
        const qs = await buscarQuestoesPorMateria(materia, 5);
        if (qs.length === 0) {
          setSemQuestoes(true);
        } else {
          setQuestoes(qs);
          setRespostas(new Array(qs.length).fill(null));
        }
      } catch {
        setSemQuestoes(true);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [materia, usuario]);

  const questaoAtual = questoes[indice];
  const acertos = respostas.filter((r, i) => r === questoes[i]?.gabarito).length;
  const pct = questoes.length > 0 ? acertos / questoes.length : 0;
  const estrelas = finalizada
    ? (pct === 1 ? 3 : pct >= 0.8 ? 2 : pct >= 0.6 ? 1 : 0)
    : 0;

  function confirmar() {
    if (selecionada === null) return;
    const novas = [...respostas];
    novas[indice] = selecionada;
    setRespostas(novas);
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

  if (carregandoAuth || carregando) return <Loading />;
  if (semQuestoes) return <SemQuestoes materia={materia} onVoltar={() => router.replace("/trilha")} />;
  if (finalizada) return (
    <TelaResultado
      acertos={acertos} total={questoes.length}
      estrelas={estrelas} onVoltar={voltar} salvando={salvando}
    />
  );
  if (!questaoAtual) return <Loading mensagem="CARREGANDO..." />;

  const acertou = confirmada && selecionada === questaoAtual.gabarito;
  const corPrimaria = "#5d2532";

  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc",
      maxWidth: 560, margin: "0 auto",
      display: "flex", flexDirection: "column",
      fontFamily: "'Montserrat', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Barra de progresso */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#ffffffee", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button onClick={() => router.replace("/trilha")} style={{
          background: "none", border: "none",
          color: "#94a3b8", cursor: "pointer",
          fontSize: 20, padding: 0, lineHeight: 1, flexShrink: 0,
        }}>✕</button>
        <div style={{
          flex: 1, height: 8, background: "#e2e8f0",
          borderRadius: 99, overflow: "hidden",
        }}>
          <div style={{
            width: `${(indice / questoes.length) * 100}%`, height: "100%",
            background: `linear-gradient(90deg, ${corPrimaria}, ${corPrimaria}bb)`,
            borderRadius: 99, transition: "width 0.4s ease",
          }} />
        </div>
        <span style={{
          fontSize: 13, color: "#64748b", fontWeight: 700, flexShrink: 0,
        }}>
          {indice + 1}/{questoes.length}
        </span>
      </div>

      <div style={{ flex: 1, padding: "24px 20px 40px", animation: "fadeIn 0.3s ease" }}>

        {/* Tags */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {[questaoAtual.banca, String(questaoAtual.ano)].map(tag => (
            <span key={tag} style={{
              padding: "4px 12px", borderRadius: 20,
              background: "#1f385611", border: "1px solid #1f385622",
              fontSize: 11, color: "#1f3856", fontWeight: 700, letterSpacing: 1,
            }}>{tag}</span>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 14, color: "#f59e0b" }}>
            {"★".repeat(questaoAtual.dificuldade)}{"☆".repeat(5 - questaoAtual.dificuldade)}
          </span>
        </div>

        {/* Enunciado */}
        <div style={{
          background: "#ffffff", border: "1px solid #e2e8f0",
          borderRadius: 14, padding: "20px 22px", marginBottom: 20,
          fontSize: 16, lineHeight: 1.8, color: "#1e293b",
          fontWeight: 500, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          {questaoAtual.enunciado}
        </div>

        {/* Alternativas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {questaoAtual.alternativas.map((alt, i) => {
            let bg = "#ffffff";
            let borderColor = "#e2e8f0";
            let textColor = "#334155";

            if (confirmada) {
              if (i === questaoAtual.gabarito) {
                bg = "rgba(34,197,94,0.08)"; borderColor = "#22c55e"; textColor = "#166534";
              } else if (i === selecionada && !acertou) {
                bg = "rgba(239,68,68,0.08)"; borderColor = "#ef4444"; textColor = "#991b1b";
              }
            } else if (i === selecionada) {
              bg = `rgba(93,37,50,0.06)`; borderColor = corPrimaria; textColor = corPrimaria;
            }

            return (
              <button key={i} onClick={() => !confirmada && setSelecionada(i)} style={{
                background: bg, border: `2px solid ${borderColor}`,
                borderRadius: 12, padding: "14px 18px",
                cursor: confirmada ? "default" : "pointer",
                textAlign: "left", color: textColor,
                fontSize: 14, fontWeight: 500, lineHeight: 1.6,
                transition: "all 0.2s",
                display: "flex", alignItems: "flex-start", gap: 14,
                fontFamily: "'Montserrat', sans-serif",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}>
                <span style={{
                  minWidth: 28, height: 28, borderRadius: 8,
                  background: `${borderColor}22`,
                  border: `1px solid ${borderColor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: borderColor, flexShrink: 0,
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

        {/* Explicação */}
        {confirmada && (
          <div style={{
            background: acertou ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
            border: `1px solid ${acertou ? "#22c55e44" : "#ef444444"}`,
            borderLeft: `4px solid ${acertou ? "#22c55e" : "#ef4444"}`,
            borderRadius: 12, padding: "16px 18px", marginBottom: 20,
            animation: "fadeIn 0.3s ease",
          }}>
            <div style={{
              fontSize: 12, fontWeight: 800, letterSpacing: 2, marginBottom: 8,
              color: acertou ? "#166534" : "#991b1b",
            }}>
              {acertou ? "✓ CORRETO — +10 XP" : "✗ INCORRETO"}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#475569", lineHeight: 1.7 }}>
              {questaoAtual.explicacao}
            </div>
          </div>
        )}

        {/* Botão */}
        {!confirmada ? (
          <button onClick={confirmar} disabled={selecionada === null} style={{
            width: "100%", padding: "16px",
            background: selecionada !== null ? corPrimaria : "#f1f5f9",
            border: `2px solid ${selecionada !== null ? corPrimaria : "#e2e8f0"}`,
            borderBottom: selecionada !== null ? `4px solid #3d1520` : "2px solid #e2e8f0",
            borderRadius: 10, cursor: selecionada !== null ? "pointer" : "not-allowed",
            fontSize: 15, fontWeight: 800,
            color: selecionada !== null ? "#fff" : "#94a3b8",
            letterSpacing: 2, fontFamily: "'Montserrat', sans-serif",
            boxShadow: selecionada !== null ? `0 4px 20px rgba(93,37,50,0.3)` : "none",
            transition: "all 0.2s",
          }}>
            CONFIRMAR
          </button>
        ) : (
          <button onClick={proxima} style={{
            width: "100%", padding: "16px",
            background: corPrimaria, border: "none",
            borderBottom: "4px solid #3d1520",
            borderRadius: 10, cursor: "pointer",
            fontSize: 15, fontWeight: 800, color: "#fff",
            letterSpacing: 2, fontFamily: "'Montserrat', sans-serif",
            boxShadow: `0 4px 20px rgba(93,37,50,0.35)`,
          }}>
            {indice + 1 >= questoes.length ? "VER RESULTADO →" : "PRÓXIMA →"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function QuestaoPage() {
  return (
    <Suspense fallback={<Loading />}>
      <QuestaoConteudo />
    </Suspense>
  );
}