"use client";
// src/app/migrar/page.tsx
//
// Página de importação de questões via JSON para o Firestore.
// Permite colar um array JSON de questões e enviá-las ao banco de dados
// sem precisar modificar o código ou fazer um novo deploy.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import type { Questao } from "@/types";

// Status de cada questão durante o processo de importação
type StatusItem = {
  id: number;
  enunciado: string;
  status: "pendente" | "enviando" | "ok" | "erro";
  mensagem?: string;
};

// Valida se um objeto tem todos os campos obrigatórios de uma Questao.
// Isso evita enviar dados malformados para o Firestore.
function validarQuestao(obj: unknown, indice: number): string | null {
  if (typeof obj !== "object" || obj === null) {
    return `Item ${indice + 1}: não é um objeto válido.`;
  }

  const q = obj as Record<string, unknown>;

  if (typeof q.id !== "number") return `Item ${indice + 1}: campo "id" deve ser um número.`;
  if (typeof q.materia !== "string" || q.materia.trim() === "") return `Item ${indice + 1}: campo "materia" deve ser uma string não vazia.`;
  if (typeof q.banca !== "string" || q.banca.trim() === "") return `Item ${indice + 1}: campo "banca" deve ser uma string não vazia.`;
  if (typeof q.ano !== "number") return `Item ${indice + 1}: campo "ano" deve ser um número.`;
  if (typeof q.dificuldade !== "number" || q.dificuldade < 1 || q.dificuldade > 5) return `Item ${indice + 1}: campo "dificuldade" deve ser um número entre 1 e 5.`;
  if (typeof q.enunciado !== "string" || q.enunciado.trim() === "") return `Item ${indice + 1}: campo "enunciado" deve ser uma string não vazia.`;
  if (!Array.isArray(q.alternativas) || q.alternativas.length < 2) return `Item ${indice + 1}: campo "alternativas" deve ser um array com pelo menos 2 itens.`;
  if (typeof q.gabarito !== "number" || q.gabarito < 0 || q.gabarito >= (q.alternativas as unknown[]).length) return `Item ${indice + 1}: campo "gabarito" deve ser um índice válido do array de alternativas.`;
  if (typeof q.explicacao !== "string" || q.explicacao.trim() === "") return `Item ${indice + 1}: campo "explicacao" deve ser uma string não vazia.`;

  return null; // null significa que a questão é válida
}

export default function MigrarPage() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  const [json, setJson] = useState("");
  const [erroValidacao, setErroValidacao] = useState("");
  const [questoesValidadas, setQuestoesValidadas] = useState<Questao[]>([]);
  const [itens, setItens] = useState<StatusItem[]>([]);
  const [rodando, setRodando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  // Atualiza o status de um item específico na lista de progresso
  function atualizarStatus(id: number, status: StatusItem["status"], mensagem?: string) {
    setItens(prev =>
      prev.map(item => item.id === id ? { ...item, status, mensagem } : item)
    );
  }

  // Valida o JSON colado pelo usuário sem ainda enviar ao Firestore.
  // Isso dá uma chance de revisar antes de importar.
  function validarJSON() {
    setErroValidacao("");
    setQuestoesValidadas([]);
    setItens([]);
    setConcluido(false);

    if (!json.trim()) {
      setErroValidacao("Cole o JSON no campo acima antes de validar.");
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setErroValidacao("JSON inválido. Verifique a sintaxe — vírgulas, chaves e colchetes.");
      return;
    }

    if (!Array.isArray(parsed)) {
      setErroValidacao("O JSON deve ser um array de questões, começando com [ e terminando com ].");
      return;
    }

    if (parsed.length === 0) {
      setErroValidacao("O array está vazio. Adicione pelo menos uma questão.");
      return;
    }

    // Valida cada questão individualmente
    for (let i = 0; i < parsed.length; i++) {
      const erro = validarQuestao(parsed[i], i);
      if (erro) {
        setErroValidacao(erro);
        return;
      }
    }

    // Se chegou aqui, todas as questões são válidas
    const questoes = parsed as Questao[];
    setQuestoesValidadas(questoes);
    setItens(questoes.map(q => ({
      id: q.id,
      enunciado: q.enunciado,
      status: "pendente",
    })));
  }

  // Envia todas as questões validadas para o Firestore uma por uma.
  // Usa o campo `id` da questão como ID do documento, garantindo
  // que rodar a importação duas vezes não duplique questões.
  async function importar() {
    if (!usuario || questoesValidadas.length === 0) return;
    setRodando(true);
    let erros = 0;

    for (const questao of questoesValidadas) {
      atualizarStatus(questao.id, "enviando");
      try {
        await setDoc(doc(db, "questoes", String(questao.id)), questao);
        atualizarStatus(questao.id, "ok");
      } catch (err) {
        atualizarStatus(questao.id, "erro", String(err));
        erros++;
      }
    }

    setRodando(false);
    setConcluido(true);

    // Se tudo deu certo, redireciona para a trilha após 3 segundos
    if (erros === 0) {
      setTimeout(() => router.push("/trilha"), 3000);
    }
  }

  if (carregando) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0a",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid #1e1e1e", borderTopColor: "#e8001e",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0a",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16, padding: 24, textAlign: "center",
      }}>
        <p style={{ color: "#e8001e", fontFamily: "var(--font-main)", fontSize: 16, fontWeight: 700 }}>
          Você precisa estar logado para importar questões.
        </p>
        <button onClick={() => router.push("/auth")} style={{
          padding: "12px 24px", background: "#e8001e", border: "none",
          borderRadius: 8, color: "#fff", cursor: "pointer",
          fontFamily: "var(--font-main)", fontWeight: 700, letterSpacing: 2,
        }}>
          IR PARA O LOGIN
        </button>
      </div>
    );
  }

  const totalOk = itens.filter(i => i.status === "ok").length;
  const totalErro = itens.filter(i => i.status === "erro").length;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", color: "#f0ece4",
      padding: "32px 20px", maxWidth: 600, margin: "0 auto",
      fontFamily: "var(--font-main)",
    }}>
      {/* Cabeçalho */}
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, marginBottom: 4 }}>
        ⚔️ IMPORTAR QUESTÕES
      </h1>
      <p style={{ color: "#444", fontSize: 13, letterSpacing: 1, marginBottom: 28 }}>
        Cole um array JSON de questões abaixo, valide e importe para o Firestore.
      </p>

      {/* Exemplo de formato */}
      <div style={{
        background: "#111", border: "1px solid #1e1e1e",
        borderLeft: "3px solid #c9a84c",
        borderRadius: 10, padding: "14px 16px", marginBottom: 24,
      }}>
        <div style={{ fontSize: 11, color: "#c9a84c", letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>
          FORMATO ESPERADO
        </div>
        <pre style={{
          fontSize: 11, color: "#555", lineHeight: 1.6,
          overflow: "auto", margin: 0, whiteSpace: "pre-wrap",
        }}>{`[
  {
    "id": 21,
    "materia": "portugues",
    "banca": "CEBRASPE",
    "ano": 2024,
    "dificuldade": 2,
    "enunciado": "Texto da questão aqui.",
    "alternativas": ["A", "B", "C", "D"],
    "gabarito": 0,
    "explicacao": "Explicação da resposta."
  }
]`}</pre>
        <div style={{ marginTop: 10, fontSize: 11, color: "#333", lineHeight: 1.7 }}>
          Materias aceitas: <span style={{ color: "#888" }}>portugues · constitucional · logico · informatica</span><br />
          Gabarito: índice da alternativa correta (0 = primeira, 1 = segunda...)<br />
          Dificuldade: número de 1 a 5
        </div>
      </div>

      {/* Campo de texto para colar o JSON */}
      {!concluido && (
        <>
          <textarea
            value={json}
            onChange={e => {
              setJson(e.target.value);
              setErroValidacao("");
              setQuestoesValidadas([]);
              setItens([]);
            }}
            placeholder='Cole o JSON aqui. Ex: [{ "id": 21, "materia": "portugues", ... }]'
            disabled={rodando}
            style={{
              width: "100%", minHeight: 200,
              background: "#111", border: "1px solid #1e1e1e",
              borderRadius: 10, padding: "14px 16px",
              color: "#f0ece4", fontSize: 13, lineHeight: 1.6,
              fontFamily: "monospace", resize: "vertical",
              outline: "none", marginBottom: 12,
              opacity: rodando ? 0.5 : 1,
            }}
          />

          {/* Mensagem de erro de validação */}
          {erroValidacao && (
            <div style={{
              padding: "12px 16px", borderRadius: 8, marginBottom: 12,
              background: "rgba(232,0,30,0.1)", border: "1px solid #e8001e44",
              fontSize: 13, color: "#ff6b6b", lineHeight: 1.6,
            }}>
              ⚠ {erroValidacao}
            </div>
          )}

          {/* Botão de validação — primeiro passo antes de importar */}
          {questoesValidadas.length === 0 && (
            <button onClick={validarJSON} disabled={rodando} style={{
              width: "100%", padding: "14px",
              background: "transparent",
              border: "2px solid #c9a84c",
              borderRadius: 8, cursor: "pointer",
              fontSize: 14, fontWeight: 700, color: "#c9a84c",
              letterSpacing: 3, marginBottom: 12,
              fontFamily: "var(--font-main)",
            }}>
              VALIDAR JSON
            </button>
          )}

          {/* Confirmação de validação bem-sucedida + botão de importar */}
          {questoesValidadas.length > 0 && !rodando && (
            <div style={{ marginBottom: 12 }}>
              <div style={{
                padding: "12px 16px", borderRadius: 8, marginBottom: 12,
                background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e44",
                fontSize: 13, color: "#22c55e",
              }}>
                ✓ {questoesValidadas.length} questão{questoesValidadas.length !== 1 ? "ões" : ""} válida{questoesValidadas.length !== 1 ? "s" : ""} e pronta{questoesValidadas.length !== 1 ? "s" : ""} para importar.
              </div>
              <button onClick={importar} style={{
                width: "100%", padding: "15px",
                background: "#e8001e", border: "none",
                borderBottom: "4px solid #a50015",
                borderRadius: 8, cursor: "pointer",
                fontSize: 15, fontWeight: 700, color: "#fff",
                letterSpacing: 3, boxShadow: "0 4px 20px rgba(232,0,30,0.3)",
                fontFamily: "var(--font-main)",
              }}>
                IMPORTAR {questoesValidadas.length} QUESTÃO{questoesValidadas.length !== 1 ? "ÕES" : ""}
              </button>
            </div>
          )}
        </>
      )}

      {/* Resultado final */}
      {concluido && (
        <div style={{
          padding: "16px", borderRadius: 10, marginBottom: 24,
          background: totalErro === 0 ? "rgba(34,197,94,0.1)" : "rgba(232,0,30,0.1)",
          border: `1px solid ${totalErro === 0 ? "#22c55e44" : "#e8001e44"}`,
        }}>
          <div style={{
            fontSize: 15, fontWeight: 700, letterSpacing: 2,
            color: totalErro === 0 ? "#22c55e" : "#e8001e", marginBottom: 6,
          }}>
            {totalErro === 0
              ? `✓ ${totalOk} questão${totalOk !== 1 ? "ões" : ""} importada${totalOk !== 1 ? "s" : ""} com sucesso!`
              : `⚠ ${totalOk} importadas, ${totalErro} com erro.`}
          </div>
          {totalErro === 0 && (
            <p style={{ fontSize: 12, color: "#555", letterSpacing: 1 }}>
              Redirecionando para a trilha em 3 segundos...
            </p>
          )}
          {totalErro > 0 && (
            <button onClick={() => { setConcluido(false); setItens([]); }} style={{
              marginTop: 10, padding: "8px 16px",
              background: "transparent", border: "1px solid #e8001e44",
              borderRadius: 6, cursor: "pointer",
              fontSize: 12, color: "#e8001e", letterSpacing: 2,
              fontFamily: "var(--font-main)",
            }}>
              TENTAR NOVAMENTE
            </button>
          )}
        </div>
      )}

      {/* Lista de progresso — aparece durante e após a importação */}
      {itens.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {itens.map(item => {
            const cor =
              item.status === "ok" ? "#22c55e" :
              item.status === "erro" ? "#e8001e" :
              item.status === "enviando" ? "#c9a84c" : "#2a2a2a";

            return (
              <div key={item.id} style={{
                padding: "10px 14px", borderRadius: 8,
                background: "#111", border: `1px solid ${cor}44`,
                display: "flex", alignItems: "center", gap: 10,
                transition: "border-color 0.3s",
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: `${cor}22`, border: `1px solid ${cor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: cor, flexShrink: 0,
                }}>
                  {item.status === "ok" ? "✓" :
                   item.status === "erro" ? "✗" :
                   item.status === "enviando" ? "⟳" : "○"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: "#444", letterSpacing: 1 }}>
                    ID #{item.id}
                  </div>
                  <div style={{
                    fontSize: 12, color: "#666",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {item.enunciado.slice(0, 60)}...
                  </div>
                  {item.mensagem && (
                    <div style={{ fontSize: 10, color: "#e8001e", marginTop: 2 }}>
                      {item.mensagem}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Link para voltar à trilha */}
      <button onClick={() => router.push("/trilha")} style={{
        marginTop: 32, background: "transparent", border: "none",
        cursor: "pointer", fontSize: 12, color: "#333",
        letterSpacing: 2, fontFamily: "var(--font-main)",
      }}>
        ← VOLTAR À TRILHA
      </button>
    </div>
  );
}