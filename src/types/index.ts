// src/types/index.ts
// Todas as interfaces TypeScript do projeto em um só lugar.
// Seguir esse padrão facilita manutenção e evita importações circulares.

// ── Autenticação ──────────────────────────────────────────────────────────────

export interface Usuario {
  uid: string;
  email: string | null;
  nome: string | null;
  fotoURL: string | null;
}

// ── Questões ──────────────────────────────────────────────────────────────────

// Uma questão do banco de dados local.
// Não vai ao Firestore — fica hardcoded em src/data/questoes.ts.
export interface Questao {
  id: number;
  materia: string;    // deve bater com o campo `id` da Trilha
  banca: string;
  ano: number;
  dificuldade: 1 | 2 | 3 | 4 | 5;
  enunciado: string;
  alternativas: string[];
  gabarito: number;   // índice da alternativa correta (0-based)
  explicacao: string;
}

// ── Trilhas ───────────────────────────────────────────────────────────────────

// Configuração estática de cada trilha (matéria).
// Fica hardcoded em src/data/trilhas.ts.
export interface ConfigTrilha {
  id: string;         // ex: "portugues", "constitucional"
  titulo: string;     // ex: "Português"
  subtitulo: string;  // ex: "Kata 1 — Domínio da Língua"
  kanji: string;      // caractere decorativo japonês
  cor: string;        // cor hex da trilha
  nos: ConfigNo[];
}

export interface ConfigNo {
  id: string;         // ex: "portugues-intro"
  tipo: "intro" | "pratica" | "revisao" | "simulado";
  label: string;
  icone: string;
  // Filtros para buscar as questões desse nó no banco
  filtroMateria: string;
  filtroDificuldade?: 1 | 2 | 3 | 4 | 5;
}

// ── Progresso (Firestore) ─────────────────────────────────────────────────────

// Armazenado em: users/{uid}/progresso/{noId}
// Rastreia o desempenho do usuário em cada nó da trilha.
export interface ProgressoNo {
  noId: string;
  completo: boolean;
  estrelas: number;       // 0 a 3 (calculado pelo % de acerto)
  ultimaTentativa: string; // ISO date
  totalAcertos: number;
  totalTentativas: number;
}

// ── Sessão de questões ────────────────────────────────────────────────────────

// Estado local durante uma sessão de questões (não persiste no Firestore até terminar).
export interface SessaoQuestao {
  questoes: Questao[];
  indiceAtual: number;
  respostas: (number | null)[]; // índice da alternativa escolhida, ou null
  finalizada: boolean;
}
