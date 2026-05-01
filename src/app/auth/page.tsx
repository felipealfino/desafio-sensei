"use client";
// src/app/auth/page.tsx
// Tela de login e cadastro do Desafio Sensei.
// Suporta: Google OAuth + Email/Senha (login e cadastro).
// Após autenticação bem-sucedida, redireciona automaticamente para /trilha.

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

// Traduz os códigos de erro do Firebase para português
function traduzirErro(codigo: string): string {
  const erros: Record<string, string> = {
    "auth/user-not-found":       "Usuário não encontrado.",
    "auth/wrong-password":       "Senha incorreta.",
    "auth/email-already-in-use": "Este email já está cadastrado.",
    "auth/weak-password":        "A senha deve ter no mínimo 6 caracteres.",
    "auth/invalid-email":        "Email inválido.",
    "auth/popup-closed-by-user": "Login com Google cancelado.",
    "auth/invalid-credential":   "Email ou senha incorretos.",
  };
  return erros[codigo] ?? "Ocorreu um erro. Tente novamente.";
}

export default function AuthPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const irParaTrilha = () => router.replace("/trilha");

  async function handleGoogle() {
    setErro("");
    setCarregando(true);
    try {
      await signInWithPopup(auth, googleProvider);
      irParaTrilha();
    } catch (e) {
      const err = e as AuthError;
      setErro(traduzirErro(err.code));
    } finally {
      setCarregando(false);
    }
  }

  async function handleEmailSenha(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      if (modo === "login") {
        await signInWithEmailAndPassword(auth, email, senha);
      } else {
        await createUserWithEmailAndPassword(auth, email, senha);
      }
      irParaTrilha();
    } catch (e) {
      const err = e as AuthError;
      setErro(traduzirErro(err.code));
    } finally {
      setCarregando(false);
    }
  }

  // ── Estilos inline para manter o arquivo autocontido ──────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px",
    background: "linear-gradient(160deg, #0d1f33 0%, #1f3856 100%)",
    borderRadius: 8, color: "#f0ece4",
    fontSize: 15, fontFamily: "var(--font-main)",
    outline: "none", letterSpacing: 0.5,
    transition: "border-color 0.2s",
  };

  const btnPrimarioStyle: React.CSSProperties = {
    width: "100%", padding: "14px",
    background: "#5d2532", border: "none",
    borderBottom: "4px solid #a50015",
    borderRadius: 8, color: "#fff",
    fontSize: 15, fontWeight: 700, letterSpacing: 3,
    cursor: carregando ? "not-allowed" : "pointer",
    fontFamily: "var(--font-main)", textTransform: "uppercase",
    opacity: carregando ? 0.6 : 1,
    transition: "opacity 0.2s, transform 0.1s",
    boxShadow: "0 4px 20px rgba(232,0,30,0.35)",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      // Textura sutil de grade no fundo
      backgroundImage: `
        linear-gradient(rgba(232,0,30,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(232,0,30,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "40px 40px",
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        animation: "fadeIn 0.4s ease",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: "#e8001e",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, margin: "0 auto 16px",
            boxShadow: "0 0 32px rgba(232,0,30,0.4)",
          }}>⚔️</div>
          <h1 style={{
            fontSize: 28, fontWeight: 700, letterSpacing: 4,
            color: "#f0ece4", lineHeight: 1,
          }}>DESAFIO</h1>
          <div style={{
            fontSize: 13, color: "#e8001e", letterSpacing: 6,
            fontWeight: 700, marginTop: 2,
          }}>SENSEI</div>
          <p style={{
            fontSize: 13, color: "#444", marginTop: 12,
            letterSpacing: 1,
          }}>
            Domine os concursos com disciplina de samurai.
          </p>
        </div>

        {/* Card principal */}
        <div style={{
          background: "#111", border: "1px solid #1e1e1e",
          borderTop: "2px solid #e8001e",
          borderRadius: 12, padding: "28px 24px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Linha de brilho */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, #e8001e88, transparent)",
          }} />

          {/* Abas Login / Cadastro */}
          <div style={{
            display: "flex", gap: 0, marginBottom: 24,
            background: "#0a0a0a", borderRadius: 8, padding: 3,
          }}>
            {(["login", "cadastro"] as const).map((m) => (
              <button key={m} onClick={() => { setModo(m); setErro(""); }} style={{
                flex: 1, padding: "9px",
                background: modo === m ? "#e8001e" : "transparent",
                border: "none", borderRadius: 6,
                color: modo === m ? "#fff" : "#444",
                fontSize: 12, fontWeight: 700, letterSpacing: 2,
                cursor: "pointer", fontFamily: "var(--font-main)",
                textTransform: "uppercase",
                transition: "all 0.2s",
                boxShadow: modo === m ? "0 2px 12px rgba(232,0,30,0.3)" : "none",
              }}>
                {m === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>

          {/* Botão Google */}
          <button onClick={handleGoogle} disabled={carregando} style={{
            width: "100%", padding: "12px",
            background: "#0a0a0a", border: "1px solid #2a2a2a",
            borderRadius: 8, color: "#f0ece4",
            fontSize: 14, fontWeight: 600, letterSpacing: 1,
            cursor: carregando ? "not-allowed" : "pointer",
            fontFamily: "var(--font-main)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginBottom: 20,
            transition: "border-color 0.2s",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>

          {/* Divisor */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
          }}>
            <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
            <span style={{ fontSize: 11, color: "#333", letterSpacing: 2 }}>OU</span>
            <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
          </div>

          {/* Formulário */}
          <form onSubmit={handleEmailSenha}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <input
                type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                required style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#e8001e55"}
                onBlur={(e) => e.target.style.borderColor = "#1e1e1e"}
              />
              <input
                type="password" placeholder="Senha" value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#e8001e55"}
                onBlur={(e) => e.target.style.borderColor = "#1e1e1e"}
              />
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 16,
                background: "rgba(232,0,30,0.1)", border: "1px solid rgba(232,0,30,0.3)",
                fontSize: 13, color: "#ff6b6b", letterSpacing: 0.5,
              }}>
                {erro}
              </div>
            )}

            <button type="submit" disabled={carregando} style={btnPrimarioStyle}
              onMouseDown={(e) => { if (!carregando) (e.target as HTMLElement).style.transform = "translateY(2px)"; }}
              onMouseUp={(e) => { (e.target as HTMLElement).style.transform = ""; }}
            >
              {carregando ? "AGUARDE..." : modo === "login" ? "⚔️ ENTRAR" : "⚔️ CRIAR CONTA"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
