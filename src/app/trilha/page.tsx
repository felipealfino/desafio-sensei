"use client";
// src/app/trilha/page.tsx
// Tela principal do app — a trilha de estudos estilo dojô.
//
// Fluxo de dados:
//   1. useAuth → pega o usuário logado
//   2. buscarTodoProgresso → carrega do Firestore o que o usuário já completou
//   3. TRILHAS_CONFIG → configuração estática das matérias (hardcoded)
//   4. Cruza os dois para calcular quais nós estão desbloqueados / completos
//   5. Ao clicar em um nó → abre modal → navega para /questao/[noId]

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { buscarTodoProgresso } from "@/lib/progresso";
import { TRILHAS_CONFIG } from "@/data/trilhas";
import type { ConfigTrilha, ConfigNo, ProgressoNo } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────

// Determina se um nó está desbloqueado.
// Regra: o primeiro nó de cada trilha sempre está desbloqueado.
// Os demais desbloqueiam quando o nó anterior foi completado.
function calcularEstadoNo(
  nos: ConfigNo[],
  indice: number,
  progresso: Map<string, ProgressoNo>
): { desbloqueado: boolean; completo: boolean; estrelas: number; atual: boolean } {
  if (indice === 0) {
    const p = progresso.get(nos[0].id);
    const completo = p?.completo ?? false;
    return { desbloqueado: true, completo, estrelas: p?.estrelas ?? 0, atual: !completo };
  }

  const noAnterior = nos[indice - 1];
  const progressoAnterior = progresso.get(noAnterior.id);
  const desbloqueado = progressoAnterior?.completo === true;

  const p = progresso.get(nos[indice].id);
  const completo = p?.completo ?? false;
  const estrelas = p?.estrelas ?? 0;
  const atual = desbloqueado && !completo;

  return { desbloqueado, completo, estrelas, atual };
}

// Posições X em % para criar o efeito de zigue-zague
const ZIGZAG = [58, 72, 44, 66, 48, 70, 42, 62];
function xPos(idx: number) { return ZIGZAG[idx % ZIGZAG.length]; }

// ── Subcomponente: Nó ──────────────────────────────────────────────────────

interface PropsNo {
  no: ConfigNo;
  cor: string;
  idx: number;
  desbloqueado: boolean;
  completo: boolean;
  estrelas: number;
  atual: boolean;
  onClick: () => void;
}

function No({ no, cor, idx, desbloqueado, completo, estrelas, atual, onClick }: PropsNo) {
  const [hover, setHover] = useState(false);
  const ativo = desbloqueado || atual;
  const x = xPos(idx);

  const bg = completo
    ? `radial-gradient(circle at 35% 35%, ${cor}ee, ${cor}88)`
    : `radial-gradient(circle at 35% 35%, #1a1a1a, #0a0a0a)`;

  const borderColor = completo ? cor : atual ? cor : desbloqueado ? "#2a2a2a" : "#141414";

  return (
    <div
      style={{
        position: "absolute", left: `${x}%`,
        transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        cursor: ativo ? "pointer" : "default", zIndex: 3,
      }}
      onClick={() => ativo && onClick()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Tooltip */}
      {hover && ativo && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 10px)",
          background: "#1a1a1a", color: "#f0ece4",
          border: `1px solid ${cor}44`, padding: "5px 12px",
          borderRadius: 6, fontSize: 11, fontWeight: 700,
          letterSpacing: 1, whiteSpace: "nowrap", pointerEvents: "none",
          fontFamily: "var(--font-main)",
        }}>
          {no.label.toUpperCase()}
        </div>
      )}

      {/* Anéis pulsantes no nó atual */}
      {atual && (
        <>
          <div style={{
            position: "absolute", width: 86, height: 86, borderRadius: "50%",
            border: `2px solid ${cor}`, animation: "pulseRing 2s ease-in-out infinite",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", width: 104, height: 104, borderRadius: "50%",
            border: `1px solid ${cor}33`, animation: "pulseRing 2s ease-in-out infinite 0.5s",
            pointerEvents: "none",
          }} />
        </>
      )}

      {/* Círculo principal */}
      <div style={{
        width: 68, height: 68, borderRadius: "50%",
        background: bg, border: `2px solid ${borderColor}`,
        boxShadow: (atual || completo)
          ? `0 0 20px ${cor}44, 0 5px 0 ${cor}44, inset 0 1px 0 rgba(255,255,255,0.08)`
          : `0 4px 0 #080808`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, opacity: !ativo ? 0.25 : 1,
        transform: hover && ativo ? "translateY(-4px) scale(1.07)" : "none",
        transition: "transform 0.2s, box-shadow 0.2s",
        position: "relative",
      }}>
        {!ativo ? "🔒" : no.icone}
        {completo && (
          <div style={{
            position: "absolute", top: 7, left: 11, width: 14, height: 7,
            borderRadius: "50%", background: "rgba(255,255,255,0.2)",
            transform: "rotate(-30deg)", pointerEvents: "none",
          }} />
        )}
      </div>

      {/* Estrelas */}
      <div style={{ display: "flex", gap: 2, marginTop: 7 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            fontSize: 13,
            color: estrelas > i ? "#c9a84c" : "#1e1e1e",
            textShadow: estrelas > i ? "0 0 6px #c9a84c88" : "none",
          }}>★</span>
        ))}
      </div>

      {atual && (
        <div style={{
          marginTop: 5, fontSize: 9, fontWeight: 700,
          color: cor, letterSpacing: 2, fontFamily: "var(--font-main)",
        }}>TREINAR</div>
      )}
    </div>
  );
}

// ── Subcomponente: Seção de uma Trilha ────────────────────────────────────

interface PropsSecao {
  trilha: ConfigTrilha;
  indice: number;
  progresso: Map<string, ProgressoNo>;
  onNoClick: (trilha: ConfigTrilha, no: ConfigNo) => void;
}

function Secao({ trilha, indice, progresso, onNoClick }: PropsSecao) {
  const alturaPorNo = 120;
  const alturaTotal = trilha.nos.length * alturaPorNo + 80;

  const nosComEstado = trilha.nos.map((no, i) => ({
    no,
    ...calcularEstadoNo(trilha.nos, i, progresso),
  }));

  const totalCompletos = nosComEstado.filter((n) => n.completo).length;
  const pctGeral = Math.round((totalCompletos / trilha.nos.length) * 100);

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Header */}
      <div style={{
        margin: "0 16px",
        background: "linear-gradient(135deg, #111 0%, #0a0a0a 100%)",
        border: `1px solid ${trilha.cor}33`, borderLeft: `3px solid ${trilha.cor}`,
        borderRadius: 10, padding: "14px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
        boxShadow: `0 4px 20px ${trilha.cor}08`,
      }}>
        {/* Kanji decorativo */}
        <div style={{
          position: "absolute", right: 56, top: "50%", transform: "translateY(-50%)",
          fontSize: 58, color: trilha.cor, opacity: 0.06,
          fontFamily: "serif", pointerEvents: "none", userSelect: "none", lineHeight: 1,
        }}>{trilha.kanji}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 3,
            color: trilha.cor, textTransform: "uppercase", marginBottom: 3,
            fontFamily: "var(--font-main)",
          }}>
            UNIDADE {indice + 1} — DOJÔ
          </div>
          <div style={{
            fontSize: 16, fontWeight: 700, color: "#f0ece4", letterSpacing: 0.5,
            fontFamily: "var(--font-main)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {trilha.titulo}
          </div>

          {/* Barra de progresso */}
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              flex: 1, height: 4, background: "#1a1a1a", borderRadius: 99, overflow: "hidden",
            }}>
              <div style={{
                width: `${pctGeral}%`, height: "100%",
                background: `linear-gradient(90deg, ${trilha.cor}, ${trilha.cor}88)`,
                borderRadius: 99, transition: "width 0.6s ease",
              }} />
            </div>
            <span style={{
              fontSize: 10, color: "#444", fontWeight: 700, letterSpacing: 1,
              fontFamily: "var(--font-main)",
            }}>
              {totalCompletos}/{trilha.nos.length}
            </span>
          </div>
        </div>

        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0, marginLeft: 12,
          background: `${trilha.cor}18`, border: `1px solid ${trilha.cor}33`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
        }}>📋</div>
      </div>

      {/* Área dos nós */}
      <div style={{ position: "relative", height: alturaTotal, width: "100%" }}>

        {/* Linhas conectoras SVG */}
        <svg style={{
          position: "absolute", top: 40, left: 0,
          width: "100%", height: alturaTotal - 40,
          pointerEvents: "none", zIndex: 1,
        }}>
          {trilha.nos.slice(0, -1).map((_, i) => {
            const x1 = xPos(i), x2 = xPos(i + 1);
            const y1 = 34 + i * alturaPorNo;
            const y2 = 34 + (i + 1) * alturaPorNo;
            const completo = nosComEstado[i].completo;
            return completo ? (
              <line key={i}
                x1={`${x1}%`} y1={y1} x2={`${x2}%`} y2={y2}
                stroke={trilha.cor} strokeWidth={2} strokeOpacity={0.4}
              />
            ) : (
              <line key={i}
                x1={`${x1}%`} y1={y1} x2={`${x2}%`} y2={y2}
                stroke="#1e1e1e" strokeWidth={2}
                strokeDasharray="6 6" strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Nós */}
        {nosComEstado.map(({ no, desbloqueado, completo, estrelas, atual }, i) => (
          <div key={no.id} style={{
            position: "absolute", top: 40 + i * alturaPorNo, width: "100%",
          }}>
            <No
              no={no} cor={trilha.cor} idx={i}
              desbloqueado={desbloqueado} completo={completo}
              estrelas={estrelas} atual={atual}
              onClick={() => onNoClick(trilha, no)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Subcomponente: Modal de confirmação ───────────────────────────────────

interface PropsModal {
  trilha: ConfigTrilha;
  no: ConfigNo;
  onFechar: () => void;
  onIniciar: () => void;
}

function Modal({ trilha, no, onFechar, onIniciar }: PropsModal) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 100, animation: "fadeIn 0.2s ease",
    }} onClick={onFechar}>
      <div style={{
        background: "#111", borderTop: `2px solid ${trilha.cor}`,
        borderRadius: "16px 16px 0 0", padding: "28px 24px 44px",
        width: "100%", maxWidth: 480,
        position: "relative", overflow: "hidden",
        animation: "slideUp 0.3s ease",
      }} onClick={(e) => e.stopPropagation()}>

        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${trilha.cor}88, transparent)`,
        }} />
        <div style={{
          position: "absolute", right: 20, top: 10, fontSize: 90,
          color: trilha.cor, opacity: 0.05,
          fontFamily: "serif", pointerEvents: "none", userSelect: "none",
        }}>{trilha.kanji}</div>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>{no.icone}</div>
          <div style={{
            fontSize: 20, fontWeight: 700, color: "#f0ece4",
            letterSpacing: 2, textTransform: "uppercase",
            fontFamily: "var(--font-main)",
          }}>{no.label}</div>
          <div style={{
            fontSize: 12, color: trilha.cor, letterSpacing: 3,
            marginTop: 4, fontWeight: 700, fontFamily: "var(--font-main)",
          }}>{trilha.titulo.toUpperCase()}</div>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-around",
          background: "#0a0a0a", border: "1px solid #1a1a1a",
          borderRadius: 10, padding: "14px 0", marginBottom: 24,
        }}>
          {[
            { label: "QUESTÕES", valor: "5" },
            { label: "TEMPO",    valor: "~5min" },
            { label: "XP",       valor: "+50" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 20, fontWeight: 700, color: trilha.cor,
                fontFamily: "var(--font-main)",
              }}>{s.valor}</div>
              <div style={{
                fontSize: 9, color: "#444", letterSpacing: 2,
                fontWeight: 700, fontFamily: "var(--font-main)",
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button onClick={onIniciar} style={{
          width: "100%", padding: "15px",
          background: trilha.cor, border: "none",
          borderBottom: `4px solid ${trilha.cor}88`,
          borderRadius: 8, cursor: "pointer",
          fontSize: 15, fontWeight: 700, color: "#fff",
          letterSpacing: 3, textTransform: "uppercase",
          boxShadow: `0 4px 24px ${trilha.cor}44`,
          fontFamily: "var(--font-main)",
        }}>
          ⚔️ Iniciar Treino
        </button>

        <button onClick={onFechar} style={{
          width: "100%", padding: "11px", background: "transparent",
          border: "none", cursor: "pointer", marginTop: 6,
          fontSize: 12, color: "#333", letterSpacing: 2,
          fontFamily: "var(--font-main)",
        }}>RECUAR</button>
      </div>
    </div>
  );
}

// ── Página Principal ───────────────────────────────────────────────────────

export default function TrilhaPage() {
  const { usuario, carregando: carregandoAuth } = useAuth();
  const router = useRouter();
  const [progresso, setProgresso] = useState<Map<string, ProgressoNo>>(new Map());
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState<{ trilha: ConfigTrilha; no: ConfigNo } | null>(null);

  // Redireciona para login se não autenticado
  useEffect(() => {
    if (!carregandoAuth && !usuario) router.replace("/auth");
  }, [usuario, carregandoAuth, router]);

  const carregarProgresso = useCallback(async () => {
    if (!usuario) return;
    setCarregando(true);
    try {
      const mapa = await buscarTodoProgresso(usuario.uid);
      setProgresso(mapa);
    } catch (err) {
      console.error("Erro ao carregar progresso:", err);
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (!carregandoAuth && usuario) carregarProgresso();
  }, [carregandoAuth, usuario, carregarProgresso]);

  const handleNoClick = (trilha: ConfigTrilha, no: ConfigNo) => {
    setModalAberto({ trilha, no });
  };

  const handleIniciar = () => {
    if (!modalAberto) return;
    // Passa o noId e filtroMateria via searchParams para a página de questões
    const { no } = modalAberto;
    router.push(`/questao?noId=${no.id}&materia=${no.filtroMateria}`);
    setModalAberto(null);
  };

  async function handleLogout() {
    await signOut(auth);
    router.replace("/auth");
  }

  // ── Tela de loading ──────────────────────────────────────────────────────
  if (carregandoAuth || carregando) {
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
        }}>CARREGANDO DOJÔ...</p>
      </div>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ece4" }}>

      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#0a0a0acc", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a1a",
        padding: "0 20px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontSize: 14, fontWeight: 700, letterSpacing: 3,
            color: "#f0ece4", fontFamily: "var(--font-main)",
          }}>DESAFIO SENSEI</div>
          <div style={{
            fontSize: 9, color: "#e8001e", letterSpacing: 3,
            fontWeight: 700, fontFamily: "var(--font-main)",
          }}>
            {usuario?.nome ?? usuario?.email ?? "GUERREIRO"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {/* XP total (soma de acertos salvos) */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <span style={{
              fontSize: 14, fontWeight: 700, color: "#e8001e",
              fontFamily: "var(--font-main)",
            }}>
              {Array.from(progresso.values()).reduce((t, p) => t + p.totalAcertos * 10, 0)}
            </span>
          </div>

          <button onClick={handleLogout} style={{
            background: "transparent", border: "1px solid #1e1e1e",
            borderRadius: 8, padding: "6px 12px",
            fontSize: 10, color: "#333", cursor: "pointer",
            letterSpacing: 1, fontFamily: "var(--font-main)",
          }}>SAIR</button>
        </div>
      </div>

      {/* Trilhas */}
      <div style={{ paddingBottom: 40, paddingTop: 8 }}>
        {TRILHAS_CONFIG.map((trilha, i) => (
          <Secao
            key={trilha.id}
            trilha={trilha}
            indice={i}
            progresso={progresso}
            onNoClick={handleNoClick}
          />
        ))}
      </div>

      {/* Modal */}
      {modalAberto && (
        <Modal
          trilha={modalAberto.trilha}
          no={modalAberto.no}
          onFechar={() => setModalAberto(null)}
          onIniciar={handleIniciar}
        />
      )}
    </div>
  );
}
