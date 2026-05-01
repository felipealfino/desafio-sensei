// src/data/trilhas.ts
import type { ConfigTrilha } from "@/types";

export const TRILHAS_CONFIG: ConfigTrilha[] = [
  {
    id: "obras-rodoviarias",
    titulo: "Obras Rodoviárias",
    subtitulo: "Domínio completo em rodovias e pavimentação",
    kanji: "道",
    cor: "#5d2532",
    nos: [
      { id: "obras-rodoviarias-intro",    tipo: "intro",    label: "Introdução",  icone: "🛣️", filtroMateria: "obras-rodoviarias" },
      { id: "obras-rodoviarias-pratica",  tipo: "pratica",  label: "Prática",     icone: "🎯", filtroMateria: "obras-rodoviarias" },
      { id: "obras-rodoviarias-revisao",  tipo: "revisao",  label: "Revisão",     icone: "🔄", filtroMateria: "obras-rodoviarias" },
      { id: "obras-rodoviarias-simulado", tipo: "simulado", label: "Simulado",    icone: "📜", filtroMateria: "obras-rodoviarias" },
    ],
  },
  {
    id: "edificacoes",
    titulo: "Edificações",
    subtitulo: "Construção civil e normas técnicas",
    kanji: "建",
    cor: "#1f3856",
    nos: [
      { id: "edificacoes-intro",    tipo: "intro",    label: "Introdução",  icone: "🏗️", filtroMateria: "edificacoes" },
      { id: "edificacoes-pratica",  tipo: "pratica",  label: "Prática",     icone: "🎯", filtroMateria: "edificacoes" },
      { id: "edificacoes-revisao",  tipo: "revisao",  label: "Revisão",     icone: "🔄", filtroMateria: "edificacoes" },
      { id: "edificacoes-simulado", tipo: "simulado", label: "Simulado",    icone: "📜", filtroMateria: "edificacoes" },
    ],
  },
  {
    id: "obras-hidricas",
    titulo: "Obras Hídricas",
    subtitulo: "Hidráulica, saneamento e barragens",
    kanji: "水",
    cor: "#1a5276",
    nos: [
      { id: "obras-hidricas-intro",    tipo: "intro",    label: "Introdução",  icone: "💧", filtroMateria: "obras-hidricas" },
      { id: "obras-hidricas-pratica",  tipo: "pratica",  label: "Prática",     icone: "🎯", filtroMateria: "obras-hidricas" },
      { id: "obras-hidricas-revisao",  tipo: "revisao",  label: "Revisão",     icone: "🔄", filtroMateria: "obras-hidricas" },
      { id: "obras-hidricas-simulado", tipo: "simulado", label: "Simulado",    icone: "📜", filtroMateria: "obras-hidricas" },
    ],
  },
  {
    id: "planejamento-normas",
    titulo: "Planejamento e Normas",
    subtitulo: "Gestão, planejamento e legislação técnica",
    kanji: "規",
    cor: "#7d6608",
    nos: [
      { id: "planejamento-normas-intro",    tipo: "intro",    label: "Introdução",  icone: "📋", filtroMateria: "planejamento-normas" },
      { id: "planejamento-normas-pratica",  tipo: "pratica",  label: "Prática",     icone: "🎯", filtroMateria: "planejamento-normas" },
      { id: "planejamento-normas-revisao",  tipo: "revisao",  label: "Revisão",     icone: "🔄", filtroMateria: "planejamento-normas" },
      { id: "planejamento-normas-simulado", tipo: "simulado", label: "Simulado",    icone: "📜", filtroMateria: "planejamento-normas" },
    ],
  },
];