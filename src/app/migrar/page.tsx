"use client";
// src/app/migrar/page.tsx
//
// PÁGINA TEMPORÁRIA — remova após rodar a migração!
//
// Essa página insere as 20 questões no Firestore usando o SDK cliente normal,
// sem precisar de chave de serviço. Funciona porque as regras do Firestore
// estão temporariamente permitindo escrita para usuários autenticados.
//
// Como usar:
//   1. Faça deploy ou rode localmente (npm run dev)
//   2. Acesse /migrar enquanto estiver logado no app
//   3. Clique em "Iniciar Migração"
//   4. Aguarde as 20 questões serem inseridas
//   5. Delete esse arquivo e faça um novo deploy
//   6. Volte as regras do Firestore para as regras seguras

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

// As 20 questões que serão inseridas no Firestore
const QUESTOES = [
  {
    id: 1, materia: "portugues", banca: "CEBRASPE", ano: 2023, dificuldade: 2,
    enunciado: "Assinale a alternativa em que a concordância verbal está correta.",
    alternativas: [
      "Fazem dois anos que não o vejo.",
      "Faz dois anos que não o vejo.",
      "Fazia dois anos que não o via, portanto ele me ligou.",
      "Faziam dois anos que não o víamos juntos.",
    ],
    gabarito: 1,
    explicacao: "O verbo 'fazer' no sentido de tempo decorrido é impessoal e fica sempre no singular: 'Faz dois anos'. Não tem sujeito, portanto não concorda com nada.",
  },
  {
    id: 2, materia: "portugues", banca: "FCC", ano: 2022, dificuldade: 2,
    enunciado: "Em qual alternativa o uso da vírgula está correto?",
    alternativas: [
      "Eu fui, ao mercado comprar pão.",
      "João comprou pão, e foi embora rapidamente.",
      "Maria, que é minha amiga, veio me visitar ontem.",
      "O livro que li, era muito interessante.",
    ],
    gabarito: 2,
    explicacao: "Orações adjetivas explicativas são sempre separadas por vírgulas. 'que é minha amiga' explica algo sobre Maria — é uma informação adicional, não restritiva.",
  },
  {
    id: 3, materia: "portugues", banca: "FGV", ano: 2023, dificuldade: 3,
    enunciado: "Assinale a alternativa em que a crase está empregada corretamente.",
    alternativas: [
      "Ele foi à pé até a escola.",
      "Ela estava à procura de emprego.",
      "Assistimos à um filme incrível.",
      "Vou à São Paulo amanhã.",
    ],
    gabarito: 1,
    explicacao: "'À procura de' usa crase porque há fusão da preposição 'a' com o artigo feminino 'a'. Não se usa crase antes de palavras masculinas, verbos ou nomes de cidades sem artigo.",
  },
  {
    id: 4, materia: "portugues", banca: "CEBRASPE", ano: 2022, dificuldade: 3,
    enunciado: "Identifique a alternativa que apresenta erro de regência verbal.",
    alternativas: [
      "Eu prefiro teatro a cinema.",
      "Ela aspirava ao cargo de diretora.",
      "Os alunos assistiram o filme até o final.",
      "O professor implicava com os alunos mais bagunceiros.",
    ],
    gabarito: 2,
    explicacao: "'Assistir' no sentido de 'ver, presenciar' é transitivo indireto: exige a preposição 'a'. O correto é 'assistiram ao filme'.",
  },
  {
    id: 5, materia: "portugues", banca: "FCC", ano: 2023, dificuldade: 4,
    enunciado: "Qual alternativa apresenta uso correto do modo subjuntivo?",
    alternativas: [
      "É possível que ele vem amanhã.",
      "Espero que você venha à festa.",
      "Tomara que ele foi aprovado.",
      "Embora ele esteve presente, nada resolveu.",
    ],
    gabarito: 1,
    explicacao: "'Espero que' exige o subjuntivo presente: 'venha'. O subjuntivo é usado em orações que expressam dúvida, desejo ou hipótese.",
  },
  {
    id: 6, materia: "constitucional", banca: "CEBRASPE", ano: 2023, dificuldade: 2,
    enunciado: "Segundo a Constituição Federal de 1988, são direitos sociais:",
    alternativas: [
      "Apenas educação, saúde e moradia.",
      "Educação, saúde, alimentação, trabalho, moradia, transporte, lazer, segurança, previdência social, proteção à maternidade e à infância, assistência aos desamparados.",
      "Educação, saúde e segurança pública.",
      "Apenas os direitos previstos no artigo 5º da CF.",
    ],
    gabarito: 1,
    explicacao: "O art. 6º da CF/88 lista expressamente todos esses direitos sociais.",
  },
  {
    id: 7, materia: "constitucional", banca: "FCC", ano: 2022, dificuldade: 3,
    enunciado: "Sobre os direitos e garantias fundamentais, é correto afirmar que:",
    alternativas: [
      "São absolutos e não admitem restrição em nenhuma hipótese.",
      "Aplicam-se apenas aos brasileiros natos, excluindo os estrangeiros.",
      "Não excluem outros decorrentes do regime e dos princípios adotados pela CF ou dos tratados internacionais.",
      "Só produzem efeitos nas relações entre o Estado e os particulares.",
    ],
    gabarito: 2,
    explicacao: "O §2º do art. 5º da CF estabelece a cláusula de abertura material: os direitos expressos não excluem outros decorrentes do regime, princípios ou tratados internacionais.",
  },
  {
    id: 8, materia: "constitucional", banca: "FGV", ano: 2023, dificuldade: 3,
    enunciado: "Quanto ao processo legislativo, o projeto de lei ordinária aprovado pelo Congresso é:",
    alternativas: [
      "Promulgado diretamente pelo Presidente do Senado.",
      "Enviado ao Presidente da República para sanção ou veto.",
      "Automaticamente promulgado após 15 dias sem manifestação do Congresso.",
      "Encaminhado ao STF para controle prévio de constitucionalidade.",
    ],
    gabarito: 1,
    explicacao: "Após aprovação pelo Congresso, o projeto vai ao Presidente da República, que tem 15 dias úteis para sancionar ou vetar.",
  },
  {
    id: 9, materia: "constitucional", banca: "CEBRASPE", ano: 2022, dificuldade: 4,
    enunciado: "Sobre o mandado de injunção, é correto afirmar que:",
    alternativas: [
      "Tem os mesmos efeitos do mandado de segurança.",
      "Destina-se a suprir a omissão normativa que inviabiliza o exercício de direitos constitucionais.",
      "Só pode ser impetrado por partidos políticos e sindicatos.",
      "Produz efeitos apenas inter partes e de forma declaratória.",
    ],
    gabarito: 1,
    explicacao: "O mandado de injunção (art. 5º, LXXI) é cabível quando a falta de norma regulamentadora torna inviável o exercício de direitos e liberdades constitucionais.",
  },
  {
    id: 10, materia: "constitucional", banca: "FCC", ano: 2023, dificuldade: 4,
    enunciado: "A respeito da organização do Estado, os Municípios:",
    alternativas: [
      "Não possuem autonomia política, apenas administrativa.",
      "Integram a Federação brasileira como entes autônomos.",
      "Estão subordinados hierarquicamente aos Estados-membros.",
      "Podem decretar estado de sítio em seu território.",
    ],
    gabarito: 1,
    explicacao: "A CF/88 inovou ao incluir os Municípios como entes federativos autônomos (art. 1º e 18), com autonomia política, legislativa, administrativa e financeira.",
  },
  {
    id: 11, materia: "logico", banca: "CEBRASPE", ano: 2023, dificuldade: 2,
    enunciado: "Se 'Todo concurseiro estuda' e 'João é concurseiro', então:",
    alternativas: [
      "João talvez estude.",
      "João certamente estuda.",
      "João não precisa estudar.",
      "Não é possível concluir nada sobre João.",
    ],
    gabarito: 1,
    explicacao: "Esse é um silogismo clássico (modus ponens): premissa universal Todo A é B, premissa particular João é A, conclusão necessária: João é B.",
  },
  {
    id: 12, materia: "logico", banca: "FGV", ano: 2022, dificuldade: 3,
    enunciado: "A negação da proposição 'Todos os servidores são pontuais' é:",
    alternativas: [
      "Nenhum servidor é pontual.",
      "Algum servidor não é pontual.",
      "Todos os servidores não são pontuais.",
      "Alguns servidores são pontuais.",
    ],
    gabarito: 1,
    explicacao: "Para negar uma proposição universal afirmativa ('Todo A é B'), usamos a particular negativa: 'Algum A não é B'. É a regra do quadrado lógico.",
  },
  {
    id: 13, materia: "logico", banca: "CEBRASPE", ano: 2023, dificuldade: 3,
    enunciado: "Dado que P → Q é verdadeiro, qual das alternativas abaixo é necessariamente verdadeira?",
    alternativas: [
      "Q → P",
      "¬P → ¬Q",
      "¬Q → ¬P",
      "P ↔ Q",
    ],
    gabarito: 2,
    explicacao: "A contrapositiva (¬Q → ¬P) é logicamente equivalente à condicional original (P → Q). A recíproca e a inversa não são equivalentes à original.",
  },
  {
    id: 14, materia: "logico", banca: "FCC", ano: 2022, dificuldade: 4,
    enunciado: "Em uma fila, Ana está à frente de Bruno, Carlos está atrás de Daniela, e Daniela está à frente de Ana. Quem está na frente de todos?",
    alternativas: [
      "Ana",
      "Bruno",
      "Carlos",
      "Daniela",
    ],
    gabarito: 3,
    explicacao: "Montando a ordem: Daniela > Ana > Bruno. Daniela está à frente de Ana e indiretamente de Bruno, portanto está na frente de todos.",
  },
  {
    id: 15, materia: "logico", banca: "FGV", ano: 2023, dificuldade: 5,
    enunciado: "Se exatamente 3 das 5 afirmativas abaixo são verdadeiras, qual conjunto é consistente? I. P é verdadeiro. II. Q é falso. III. P→Q é verdadeiro. IV. ¬P é verdadeiro. V. P∨Q é verdadeiro.",
    alternativas: [
      "I, II e V são verdadeiras.",
      "II, III e IV são verdadeiras.",
      "I, III e V são verdadeiras.",
      "I, II e III são verdadeiras.",
    ],
    gabarito: 0,
    explicacao: "Se P=V e Q=F, então P∨Q=V (I, II e V verdadeiras) e P→Q=F e ¬P=F (III e IV falsas). Resultado: exatamente 3 verdadeiras — consistente.",
  },
  {
    id: 16, materia: "informatica", banca: "CEBRASPE", ano: 2023, dificuldade: 1,
    enunciado: "O protocolo HTTP opera na camada:",
    alternativas: [
      "Física do modelo OSI.",
      "Transporte do modelo OSI.",
      "Aplicação do modelo OSI.",
      "Rede do modelo OSI.",
    ],
    gabarito: 2,
    explicacao: "HTTP é um protocolo da camada 7 — Aplicação — do modelo OSI, onde ficam os protocolos usados diretamente pelos aplicativos: HTTP, FTP, SMTP, DNS.",
  },
  {
    id: 17, materia: "informatica", banca: "FGV", ano: 2022, dificuldade: 2,
    enunciado: "Em relação à segurança da informação, o princípio que garante que a informação só pode ser acessada por pessoas autorizadas é:",
    alternativas: [
      "Integridade.",
      "Disponibilidade.",
      "Confidencialidade.",
      "Autenticidade.",
    ],
    gabarito: 2,
    explicacao: "O tripé da segurança é CID: Confidencialidade (acesso restrito), Integridade (dados não alterados) e Disponibilidade (acesso quando necessário).",
  },
  {
    id: 18, materia: "informatica", banca: "FCC", ano: 2023, dificuldade: 2,
    enunciado: "Em uma planilha Excel, a fórmula =SOMA(A1:A5) realiza:",
    alternativas: [
      "A média dos valores de A1 até A5.",
      "A soma dos valores de A1 até A5.",
      "O maior valor entre A1 e A5.",
      "A contagem de células preenchidas de A1 a A5.",
    ],
    gabarito: 1,
    explicacao: "=SOMA() é a função de adição. Para média seria =MÉDIA(), para máximo =MÁXIMO(), para contar preenchidas =CONT.VALORES().",
  },
  {
    id: 19, materia: "informatica", banca: "CEBRASPE", ano: 2022, dificuldade: 3,
    enunciado: "Sobre backup, o tipo que copia apenas os arquivos modificados desde o último backup completo é:",
    alternativas: [
      "Backup completo.",
      "Backup diferencial.",
      "Backup incremental.",
      "Backup espelho.",
    ],
    gabarito: 1,
    explicacao: "O backup diferencial copia tudo que mudou desde o último backup completo. O incremental copia só o que mudou desde o último backup de qualquer tipo.",
  },
  {
    id: 20, materia: "informatica", banca: "FGV", ano: 2023, dificuldade: 3,
    enunciado: "O conceito de 'nuvem pública' em computação em nuvem refere-se a:",
    alternativas: [
      "Infraestrutura exclusiva de uma única organização.",
      "Serviços oferecidos pela internet a múltiplos clientes por um provedor externo.",
      "Uma rede privada virtual (VPN) entre filiais de uma empresa.",
      "Servidores físicos localizados dentro da empresa.",
    ],
    gabarito: 1,
    explicacao: "Nuvem pública é a infraestrutura de um provedor (AWS, Azure, GCP) compartilhada por múltiplos clientes via internet.",
  },
];

// Tipo para rastrear o status de cada questão durante a migração
type StatusItem = {
  id: number;
  status: "pendente" | "migrando" | "ok" | "erro";
  mensagem?: string;
};

export default function MigrarPage() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();
  const [itens, setItens] = useState<StatusItem[]>(
    QUESTOES.map((q) => ({ id: q.id, status: "pendente" }))
  );
  const [rodando, setRodando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  // Atualiza o status de uma questão específica na lista
  function atualizarItem(id: number, status: StatusItem["status"], mensagem?: string) {
    setItens((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, mensagem } : item))
    );
  }

  async function iniciarMigracao() {
    if (!usuario) return;
    setRodando(true);

    let erros = 0;
    for (const questao of QUESTOES) {
      atualizarItem(questao.id, "migrando");
      try {
        // Usa o ID da questão como ID do documento — garante idempotência
        await setDoc(doc(db, "questoes", String(questao.id)), questao);
        atualizarItem(questao.id, "ok");
      } catch (err) {
        console.error(`Erro na questão ${questao.id}:`, err);
        atualizarItem(questao.id, "erro", String(err));
        erros++;
      }
    }

    setRodando(false);
    setConcluido(true);

    if (erros === 0) {
      // Aguarda 3 segundos para o usuário ver o resultado e redireciona
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
          Você precisa estar logado para rodar a migração.
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

  const totalOk = itens.filter((i) => i.status === "ok").length;
  const totalErro = itens.filter((i) => i.status === "erro").length;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", color: "#f0ece4",
      padding: "32px 20px", maxWidth: 480, margin: "0 auto",
      fontFamily: "var(--font-main)",
    }}>
      <h1 style={{
        fontSize: 22, fontWeight: 700, letterSpacing: 3,
        color: "#f0ece4", marginBottom: 4,
      }}>
        ⚔️ MIGRAÇÃO DE QUESTÕES
      </h1>
      <p style={{ color: "#444", fontSize: 13, letterSpacing: 1, marginBottom: 24 }}>
        Página temporária — remova após usar.
      </p>

      {/* Botão de início */}
      {!rodando && !concluido && (
        <button onClick={iniciarMigracao} style={{
          width: "100%", padding: "15px",
          background: "#e8001e", border: "none",
          borderBottom: "4px solid #a50015",
          borderRadius: 8, cursor: "pointer",
          fontSize: 15, fontWeight: 700, color: "#fff",
          letterSpacing: 3, marginBottom: 24,
          boxShadow: "0 4px 20px rgba(232,0,30,0.3)",
        }}>
          INICIAR MIGRAÇÃO ({QUESTOES.length} questões)
        </button>
      )}

      {/* Resultado final */}
      {concluido && (
        <div style={{
          padding: "16px", borderRadius: 10, marginBottom: 24,
          background: totalErro === 0 ? "rgba(34,197,94,0.1)" : "rgba(232,0,30,0.1)",
          border: `1px solid ${totalErro === 0 ? "#22c55e44" : "#e8001e44"}`,
        }}>
          <div style={{
            fontSize: 14, fontWeight: 700, letterSpacing: 2,
            color: totalErro === 0 ? "#22c55e" : "#e8001e",
            marginBottom: 6,
          }}>
            {totalErro === 0
              ? `✓ CONCLUÍDO — ${totalOk} questões migradas com sucesso!`
              : `⚠ ${totalOk} ok, ${totalErro} erros`}
          </div>
          {totalErro === 0 && (
            <p style={{ fontSize: 12, color: "#555", letterSpacing: 1 }}>
              Redirecionando para a trilha em 3 segundos... Lembre-se de remover
              esta página e restaurar as regras do Firestore.
            </p>
          )}
        </div>
      )}

      {/* Lista de questões com status */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {itens.map((item) => {
          const questao = QUESTOES.find((q) => q.id === item.id)!;
          const cor =
            item.status === "ok" ? "#22c55e" :
            item.status === "erro" ? "#e8001e" :
            item.status === "migrando" ? "#c9a84c" : "#2a2a2a";

          return (
            <div key={item.id} style={{
              padding: "10px 14px", borderRadius: 8,
              background: "#111", border: `1px solid ${cor}44`,
              display: "flex", alignItems: "center", gap: 10,
              transition: "border-color 0.3s",
            }}>
              {/* Ícone de status */}
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: `${cor}22`, border: `1px solid ${cor}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: cor, flexShrink: 0,
              }}>
                {item.status === "ok" ? "✓" :
                 item.status === "erro" ? "✗" :
                 item.status === "migrando" ? "⟳" : "○"}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>
                  #{item.id} · {questao.materia.toUpperCase()} · {questao.banca}
                </div>
                <div style={{
                  fontSize: 12, color: "#888",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {questao.enunciado.slice(0, 55)}...
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
