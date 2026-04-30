// src/lib/progresso.ts
// Funções de acesso ao Firestore para salvar e buscar o progresso do usuário.
//
// Estrutura no Firestore:
//   users/{uid}/progresso/{noId}  →  ProgressoNo
//
// Por que subcoleção por usuário?
// Garante isolamento total dos dados — um usuário nunca vê dados de outro,
// e as regras de segurança do Firestore ficam simples: "só pode ler/escrever
// documentos onde o path contém seu próprio uid".

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ProgressoNo } from "@/types";

// Caminho base da subcoleção de progresso de um usuário
function refProgresso(uid: string) {
  return collection(db, "users", uid, "progresso");
}

// Busca o progresso de todos os nós de um usuário.
// Retorna um Map para acesso O(1) por noId.
export async function buscarTodoProgresso(
  uid: string
): Promise<Map<string, ProgressoNo>> {
  const snap = await getDocs(refProgresso(uid));
  const mapa = new Map<string, ProgressoNo>();
  snap.forEach((doc) => {
    mapa.set(doc.id, doc.data() as ProgressoNo);
  });
  return mapa;
}

// Busca o progresso de um nó específico.
// Retorna null se o usuário nunca tentou esse nó.
export async function buscarProgressoNo(
  uid: string,
  noId: string
): Promise<ProgressoNo | null> {
  const snap = await getDoc(doc(refProgresso(uid), noId));
  return snap.exists() ? (snap.data() as ProgressoNo) : null;
}

// Salva ou atualiza o progresso de um nó após o usuário finalizar uma sessão.
// O cálculo de estrelas é feito aqui: 0–49% = 0★, 50–74% = 1★, 75–89% = 2★, 90–100% = 3★
export async function salvarProgressoNo(
  uid: string,
  noId: string,
  acertos: number,
  totalQuestoes: number
): Promise<ProgressoNo> {
  const pct = totalQuestoes > 0 ? acertos / totalQuestoes : 0;

  const estrelas =
    pct >= 0.9 ? 3 :
    pct >= 0.75 ? 2 :
    pct >= 0.5 ? 1 : 0;

  // Busca progresso anterior para acumular estatísticas
  const anterior = await buscarProgressoNo(uid, noId);

  const atualizado: ProgressoNo = {
    noId,
    completo: pct >= 0.5, // consideramos "completo" a partir de 50% de acerto
    estrelas: Math.max(estrelas, anterior?.estrelas ?? 0), // mantém a melhor pontuação
    ultimaTentativa: new Date().toISOString(),
    totalAcertos: (anterior?.totalAcertos ?? 0) + acertos,
    totalTentativas: (anterior?.totalTentativas ?? 0) + totalQuestoes,
  };

  await setDoc(doc(refProgresso(uid), noId), atualizado);
  return atualizado;
}
