// src/data/trilhas.ts
// Configuração estática das trilhas do Desafio Sensei.
// Cada trilha representa uma matéria de concurso com seus nós de aprendizado.
//
// Para adicionar uma nova matéria: basta criar um novo objeto nesse array.
// O campo `filtroMateria` deve bater com o campo `materia` das questões em questoes.ts.

import type { ConfigTrilha } from "@/types";

export const TRILHAS_CONFIG: ConfigTrilha[] = [
  {
    id: "portugues",
    titulo: "Português",
    subtitulo: "Kata 1 — Domínio da Língua",
    kanji: "語",
    cor: "#e8001e",
    nos: [
      {
        id: "portugues-intro",
        tipo: "intro",
        label: "Introdução",
        icone: "⚔️",
        filtroMateria: "portugues",
        filtroDificuldade: 2,
      },
      {
        id: "portugues-pratica",
        tipo: "pratica",
        label: "Prática",
        icone: "🎯",
        filtroMateria: "portugues",
      },
      {
        id: "portugues-revisao",
        tipo: "revisao",
        label: "Revisão",
        icone: "🔄",
        filtroMateria: "portugues",
        filtroDificuldade: 3,
      },
      {
        id: "portugues-simulado",
        tipo: "simulado",
        label: "Simulado",
        icone: "📜",
        filtroMateria: "portugues",
      },
    ],
  },
  {
    id: "constitucional",
    titulo: "Dir. Constitucional",
    subtitulo: "Kata 2 — Lei Suprema",
    kanji: "法",
    cor: "#c9a84c",
    nos: [
      {
        id: "constitucional-intro",
        tipo: "intro",
        label: "Introdução",
        icone: "⚔️",
        filtroMateria: "constitucional",
        filtroDificuldade: 2,
      },
      {
        id: "constitucional-pratica",
        tipo: "pratica",
        label: "Prática",
        icone: "🎯",
        filtroMateria: "constitucional",
      },
      {
        id: "constitucional-revisao",
        tipo: "revisao",
        label: "Revisão",
        icone: "🔄",
        filtroMateria: "constitucional",
        filtroDificuldade: 3,
      },
      {
        id: "constitucional-simulado",
        tipo: "simulado",
        label: "Simulado",
        icone: "📜",
        filtroMateria: "constitucional",
      },
    ],
  },
  {
    id: "logico",
    titulo: "Raciocínio Lógico",
    subtitulo: "Kata 3 — Mente Afiada",
    kanji: "理",
    cor: "#5b8dee",
    nos: [
      {
        id: "logico-intro",
        tipo: "intro",
        label: "Introdução",
        icone: "⚔️",
        filtroMateria: "logico",
        filtroDificuldade: 2,
      },
      {
        id: "logico-pratica",
        tipo: "pratica",
        label: "Prática",
        icone: "🎯",
        filtroMateria: "logico",
      },
      {
        id: "logico-revisao",
        tipo: "revisao",
        label: "Revisão",
        icone: "🔄",
        filtroMateria: "logico",
      },
      {
        id: "logico-simulado",
        tipo: "simulado",
        label: "Simulado",
        icone: "📜",
        filtroMateria: "logico",
      },
    ],
  },
  {
    id: "informatica",
    titulo: "Informática",
    subtitulo: "Kata 4 — Era Digital",
    kanji: "電",
    cor: "#22c55e",
    nos: [
      {
        id: "informatica-intro",
        tipo: "intro",
        label: "Introdução",
        icone: "⚔️",
        filtroMateria: "informatica",
        filtroDificuldade: 1,
      },
      {
        id: "informatica-pratica",
        tipo: "pratica",
        label: "Prática",
        icone: "🎯",
        filtroMateria: "informatica",
      },
      {
        id: "informatica-revisao",
        tipo: "revisao",
        label: "Revisão",
        icone: "🔄",
        filtroMateria: "informatica",
      },
      {
        id: "informatica-simulado",
        tipo: "simulado",
        label: "Simulado",
        icone: "📜",
        filtroMateria: "informatica",
      },
    ],
  },
];
