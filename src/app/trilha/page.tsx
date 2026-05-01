"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { buscarTodoProgresso } from "@/lib/progresso";
import { TRILHAS_CONFIG } from "@/data/trilhas";
import type { ConfigTrilha, ConfigNo, ProgressoNo } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────

function calcularEstadoNo(
  nos: ConfigNo[],
  indice: number,
  progresso: Map<string, ProgressoNo>
) {
  if (indice === 0) {
    const p = progresso.get(nos[0].id);
    const completo = p?.completo ?? false;
    return { desbloqueado: true, completo, estrelas: p?.estrelas ?? 0, atual: !completo };
  }
  const progressoAnterior = progresso.get(nos[indice - 1].id);
  const desbloqueado = progressoAnterior?.completo === true;
  const p = progresso.get(nos[indice].id);
  const completo = p?.completo ?? false;
  return { desbloqueado, completo, estrelas: p?.estrelas ?? 0, atual: desbloqueado && !completo };
}

const ZIGZAG = [42, 58, 34, 52, 44, 62, 36, 50];
function xPos(idx: number) { return ZIGZAG[idx % ZIGZAG.length]; }

// ── Nó da trilha ───────────────────────────────────────────────────────────

function No({ no, cor, idx, desbloqueado, completo, estrelas, atual, onClick }: {
  no: ConfigNo; cor: string; idx: number;
  desbloqueado: boolean; completo: boolean;
  estrelas: number; atual: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const ativo = desbloqueado || atual;
  const x = xPos(idx);

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
          background: "#1f3856", color: "#fff",
          border: `1px solid ${cor}66`,
          padding: "6px 14px", borderRadius: 8,
          fontSize: 13, fontWeight: 700,
          whiteSpace: "nowrap", pointerEvents: "none",
          fontFamily: "'Montserrat', sans-serif",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}>
          {no.label}
        </div>
      )}

      {/* Anel pulsante */}
      {atual && (
        <>
          <div style={{
            position: "absolute", width: 90, height: 90, borderRadius: "50%",
            border: `3px solid ${cor}`,
            animation: "pulseRing 2s ease-in-out infinite",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", width: 108, height: 108, borderRadius: "50%",
            border: `2px solid ${cor}44`,
            animation: "pulseRing 2s ease-in-out infinite 0.5s",
            pointerEvents: "none",
          }} />
        </>
      )}

      {/* Círculo */}
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: completo
          ? `radial-gradient(circle at 35% 35%, ${cor}, ${cor}bb)`
          : atual
          ? "#ffffff"
          : desbloqueado ? "#f0f4f8" : "#e2e8f0",
        border: `3px solid ${completo || atual ? cor : "#cbd5e1"}`,
        boxShadow: (atual || completo)
          ? `0 0 24px ${cor}55, 0 6px 0 ${cor}44`
          : "0 4px 12px rgba(0,0,0,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, opacity: !ativo ? 0.4 : 1,
        transform: hover && ativo ? "translateY(-5px) scale(1.08)" : "none",
        transition: "transform 0.2s, box-shadow 0.2s",
        position: "relative",
      }}>
        {!ativo ? "🔒" : no.icone}
        {completo && (
          <div style={{
            position: "absolute", top: 8, left: 12, width: 16, height: 8,
            borderRadius: "50%", background: "rgba(255,255,255,0.3)",
            transform: "rotate(-30deg)", pointerEvents: "none",
          }} />
        )}
      </div>

      {/* Label */}
      <div style={{
        marginTop: 8, fontSize: 12, fontWeight: 700,
        color: ativo ? "#1f3856" : "#94a3b8",
        fontFamily: "'Montserrat', sans-serif",
        textAlign: "center",
      }}>
        {no.label}
      </div>

      {/* Estrelas */}
      <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            fontSize: 14,
            color: estrelas > i ? "#f59e0b" : "#cbd5e1",
            textShadow: estrelas > i ? "0 0 6px #f59e0b88" : "none",
          }}>★</span>
        ))}
      </div>

      {atual && (
        <div style={{
          marginTop: 4, fontSize: 10, fontWeight: 800,
          color: cor, letterSpacing: 2,
          fontFamily: "'Montserrat', sans-serif",
        }}>TREINAR</div>
      )}
    </div>
  );
}

// ── Seção da trilha ────────────────────────────────────────────────────────

function Secao({ trilha, progresso, onNoClick }: {
  trilha: ConfigTrilha;
  progresso: Map<string, ProgressoNo>;
  onNoClick: (no: ConfigNo) => void;
}) {
  const alturaPorNo = 140;
  const alturaTotal = trilha.nos.length * alturaPorNo + 60;

  const nosComEstado = trilha.nos.map((no, i) => ({
    no, ...calcularEstadoNo(trilha.nos, i, progresso),
  }));

  const totalCompletos = nosComEstado.filter(n => n.completo).length;
  const pct = Math.round((totalCompletos / trilha.nos.length) * 100);

  return (
    <div style={{ position: "relative", height: alturaTotal, width: "100%" }}>

      {/* Barra de progresso no topo da seção */}
      <div style={{
        position: "absolute", top: 0, left: 24, right: 24,
        display: "flex", alignItems: "center", gap: 12,
        zIndex: 4,
      }}>
        <div style={{
          flex: 1, height: 6, background: "#e2e8f0",
          borderRadius: 99, overflow: "hidden",
        }}>
          <div style={{
            width: `${pct}%`, height: "100%",
            background: `linear-gradient(90deg, ${trilha.cor}, ${trilha.cor}bb)`,
            borderRadius: 99, transition: "width 0.6s ease",
          }} />
        </div>
        <span style={{
          fontSize: 12, fontWeight: 700, color: "#64748b",
          fontFamily: "'Montserrat', sans-serif",
        }}>
          {totalCompletos}/{trilha.nos.length}
        </span>
      </div>

      {/* SVG conectando os nós */}
      <svg style={{
        position: "absolute", top: 24, left: 0,
        width: "100%", height: alturaTotal - 24,
        pointerEvents: "none", zIndex: 1,
      }}>
        {trilha.nos.slice(0, -1).map((_, i) => {
          const x1 = xPos(i), x2 = xPos(i + 1);
          const y1 = 50 + i * alturaPorNo;
          const y2 = 50 + (i + 1) * alturaPorNo;
          const completo = nosComEstado[i].completo;
          return completo ? (
            <line key={i}
              x1={`${x1}%`} y1={y1} x2={`${x2}%`} y2={y2}
              stroke={trilha.cor} strokeWidth={3} strokeOpacity={0.5}
            />
          ) : (
            <line key={i}
              x1={`${x1}%`} y1={y1} x2={`${x2}%`} y2={y2}
              stroke="#cbd5e1" strokeWidth={2}
              strokeDasharray="8 6" strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Nós */}
      {nosComEstado.map(({ no, desbloqueado, completo, estrelas, atual }, i) => (
        <div key={no.id} style={{
          position: "absolute", top: 24 + i * alturaPorNo, width: "100%",
        }}>
          <No
            no={no} cor={trilha.cor} idx={i}
            desbloqueado={desbloqueado} completo={completo}
            estrelas={estrelas} atual={atual}
            onClick={() => onNoClick(no)}
          />
        </div>
      ))}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────

function Modal({ trilha, no, onFechar, onIniciar }: {
  trilha: ConfigTrilha; no: ConfigNo;
  onFechar: () => void; onIniciar: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(13,31,51,0.7)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(4px)",
    }} onClick={onFechar}>
      <div style={{
        background: "#ffffff",
        borderTop: `4px solid ${trilha.cor}`,
        borderRadius: "20px 20px 0 0",
        padding: "32px 28px 48px",
        width: "100%", maxWidth: 520,
        animation: "slideUp 0.3s ease",
        fontFamily: "'Montserrat', sans-serif",
      }} onClick={e => e.stopPropagation()}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{no.icone}</div>
          <div style={{
            fontSize: 22, fontWeight: 800, color: "#1f3856", marginBottom: 6,
          }}>{no.label}</div>
          <div style={{
            fontSize: 14, fontWeight: 600, color: trilha.cor, letterSpacing: 1,
          }}>{trilha.titulo.toUpperCase()}</div>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-around",
          background: "#f8fafc", borderRadius: 14,
          padding: "18px 0", marginBottom: 28,
          border: "1px solid #e2e8f0",
        }}>
          {[
            { label: "QUESTÕES", valor: "5" },
            { label: "TEMPO",    valor: "~5 min" },
            { label: "XP",       valor: "+50" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: trilha.cor }}>{s.valor}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button onClick={onIniciar} style={{
          width: "100%", padding: "16px",
          background: trilha.cor, border: "none",
          borderBottom: `4px solid ${trilha.cor}cc`,
          borderRadius: 12, cursor: "pointer",
          fontSize: 16, fontWeight: 800, color: "#fff",
          letterSpacing: 2, fontFamily: "'Montserrat', sans-serif",
          boxShadow: `0 6px 24px ${trilha.cor}44`,
        }}>
          ⚔️ INICIAR TREINO
        </button>

        <button onClick={onFechar} style={{
          width: "100%", padding: "12px",
          background: "transparent", border: "none",
          cursor: "pointer", marginTop: 8,
          fontSize: 13, fontWeight: 700, color: "#94a3b8",
          fontFamily: "'Montserrat', sans-serif",
        }}>
          Voltar
        </button>
      </div>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────

function TrilhaConteudo() {
  const { usuario, carregando: carregandoAuth } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const materiaId = params.get("materia") ?? "";

  const [progresso, setProgresso] = useState<Map<string, ProgressoNo>>(new Map());
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState<ConfigNo | null>(null);

  // Encontra a trilha da matéria selecionada
  const trilha = TRILHAS_CONFIG.find(t => t.id === materiaId) ?? TRILHAS_CONFIG[0];

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

  const handleIniciar = () => {
    if (!modalAberto) return;
    router.push(`/questao?noId=${modalAberto.id}&materia=${modalAberto.filtroMateria}`);
    setModalAberto(null);
  };

  async function handleLogout() {
    await signOut(auth);
    router.replace("/auth");
  }

  if (carregandoAuth || carregando) return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: "4px solid #e2e8f0", borderTopColor: "#5d2532",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{
        color: "#94a3b8", fontSize: 13, letterSpacing: 3,
        fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
      }}>CARREGANDO...</p>
    </div>
  );

  const primeiroNome = usuario?.nome?.split(" ")[0] ?? "Concurseiro";
  const totalCompletos = trilha.nos.filter(no => progresso.get(no.id)?.completo).length;
  const xpTotal = Array.from(progresso.values()).reduce((t, p) => t + p.totalAcertos * 10, 0);

  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc",
      fontFamily: "'Montserrat', sans-serif",
      color: "#1f3856",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50%       { transform: scale(1.12); opacity: 0.2; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top bar */}
      <div style={{
        background: "#091828",
        borderBottom: `3px solid ${trilha.cor}`,
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/home")} style={{
            background: "rgba(255,255,255,0.1)",
            border: "none", borderRadius: 8,
            width: 36, height: 36, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#fff",
          }}>←</button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff" }}>
              {trilha.titulo}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: trilha.cor, letterSpacing: 1 }}>
              {totalCompletos}/{trilha.nos.length} nós completos
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#f59e0b" }}>{xpTotal}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{primeiroNome}</div>
          </div>
          <button onClick={handleLogout} style={{
            background: "transparent", border: "2px solid rgba(255,255,255,0.2)",
            borderRadius: 8, padding: "6px 14px",
            fontSize: 12, fontWeight: 700, color: "#fff",
            cursor: "pointer", fontFamily: "'Montserrat', sans-serif",
          }}>SAIR</button>
        </div>
      </div>

      {/* Header da matéria */}
      <div style={{
        background: `linear-gradient(135deg, #091828 0%, ${trilha.cor}33 100%)`,
        padding: "40px 24px 48px",
        textAlign: "center",
        borderBottom: "1px solid #e2e8f0",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)",
          fontSize: 120, color: trilha.cor, opacity: 0.06,
          fontFamily: "serif", pointerEvents: "none", userSelect: "none",
        }}>{trilha.kanji}</div>

        <div style={{
          fontSize: 48, marginBottom: 12,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
        }}>
          {trilha.id === "obras-rodoviarias" ? "🛣️" :
           trilha.id === "edificacoes" ? "🏗️" :
           trilha.id === "obras-hidricas" ? "💧" : "📋"}
        </div>
        <h1 style={{
          fontSize: 32, fontWeight: 900, color: "#ffffff", marginBottom: 8,
        }}>{trilha.titulo}</h1>
        <p style={{
          fontSize: 15, fontWeight: 500, color: "#8aa8c4",
        }}>{trilha.subtitulo}</p>
      </div>

      {/* Trilha */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 20px 80px" }}>
        <Secao
          trilha={trilha}
          progresso={progresso}
          onNoClick={no => setModalAberto(no)}
        />
      </div>

      {/* Modal */}
      {modalAberto && (
        <Modal
          trilha={trilha}
          no={modalAberto}
          onFechar={() => setModalAberto(null)}
          onIniciar={handleIniciar}
        />
      )}
    </div>
  );
}

export default function TrilhaPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", background: "#f8fafc",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "4px solid #e2e8f0", borderTopColor: "#5d2532",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    }>
      <TrilhaConteudo />
    </Suspense>
  );
}