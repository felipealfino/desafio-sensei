// src/data/questoes.ts
// Banco de questões local. Não usa Firestore — as questões ficam no próprio app.
// Isso tem uma vantagem prática: funciona offline e não gera custo de leitura no Firestore.
//
// Para adicionar novas questões: basta inserir um novo objeto nesse array.
// O campo `materia` deve bater exatamente com o `filtroMateria` dos nós em trilhas.ts.

import type { Questao } from "@/types";

export const BANCO_QUESTOES: Questao[] = [

  // ── PORTUGUÊS ──────────────────────────────────────────────────────────────

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
    explicacao: "Orações adjetivas explicativas são sempre separadas por vírgulas. 'que é minha amiga' explica algo sobre Maria — é uma informação adicional, não restritiva. As demais alternativas violam regras básicas: não se separa sujeito do predicado nem verbo do objeto com vírgula.",
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
    explicacao: "'À procura de' usa crase porque há fusão da preposição 'a' com o artigo feminino 'a'. Não se usa crase antes de palavras masculinas, antes de verbos, nem antes de nomes de cidades que não admitem artigo.",
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
    explicacao: "'Assistir' no sentido de 'ver, presenciar' é transitivo indireto: exige a preposição 'a'. O correto é 'assistiram ao filme'. Sem a preposição, 'assistir' muda de sentido para 'prestar assistência'.",
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
    explicacao: "'Espero que' exige o subjuntivo presente: 'venha'. O subjuntivo é usado em orações subordinadas que expressam dúvida, desejo ou hipótese. Após 'embora' o correto é 'estivesse' (imperfeito do subjuntivo).",
  },

  // ── DIREITO CONSTITUCIONAL ─────────────────────────────────────────────────

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
    explicacao: "O art. 6º da CF/88 lista expressamente todos esses direitos sociais. É uma questão de literalidade do texto constitucional — o examinador costuma cobrar a lista completa ou questionar se tal direito está ou não incluído.",
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
    explicacao: "O §2º do art. 5º da CF estabelece que os direitos e garantias expressos na Constituição não excluem outros decorrentes do regime, dos princípios ou dos tratados internacionais de direitos humanos. Isso é chamado de cláusula de abertura material.",
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
    explicacao: "Após aprovação pelo Congresso, o projeto vai ao Presidente da República, que tem 15 dias úteis para sancionar ou vetar. O veto pode ser total ou parcial. O controle do STF, na regra geral, é posterior (repressivo), não prévio.",
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
    explicacao: "O mandado de injunção (art. 5º, LXXI) é cabível quando a falta de norma regulamentadora torna inviável o exercício de direitos e liberdades constitucionais. O STF evoluiu para admitir efeitos erga omnes em casos de omissão legislativa sistemática.",
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
    explicacao: "A CF/88 inovou ao incluir os Municípios como entes federativos autônomos (art. 1º e 18). Eles têm autonomia política (elegem prefeito e vereadores), legislativa (lei orgânica e leis municipais), administrativa e financeira.",
  },

  // ── RACIOCÍNIO LÓGICO ──────────────────────────────────────────────────────

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
    explicacao: "Esse é um silogismo clássico (modus ponens): Premissa 1 (universal): Todo A é B. Premissa 2 (particular): João é A. Conclusão necessária: João é B. A conclusão é certa, não apenas provável.",
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
    explicacao: "Para negar uma proposição universal afirmativa ('Todo A é B'), usamos a particular negativa: 'Algum A não é B'. Basta existir um único servidor não pontual para derrubar a afirmação de que todos são. Essa é a regra do quadrado lógico.",
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
    explicacao: "A contrapositiva (¬Q → ¬P) é logicamente equivalente à condicional original (P → Q). Ou seja, se P implica Q, então a ausência de Q implica a ausência de P. A recíproca (Q → P) e a inversa (¬P → ¬Q) não são equivalentes à original.",
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
    explicacao: "Montando a ordem: Daniela > Ana > Bruno. Carlos está atrás de Daniela, mas não sabemos sua posição exata em relação a Ana e Bruno. Entretanto, a única posição que satisfaz todas as condições para 'frente de todos' é Daniela, já que está à frente de Ana e indiretamente de Bruno.",
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
    explicacao: "Testando a alternativa A: Se P é verdadeiro (I) e Q é falso (II), então P∨Q é verdadeiro (V) ✓. P→Q seria falso (pois P=V e Q=F), então III é falsa ✓. ¬P seria falso, então IV é falsa ✓. Resultado: exatamente I, II e V verdadeiras — consistente.",
  },

  // ── INFORMÁTICA ────────────────────────────────────────────────────────────

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
    explicacao: "HTTP (HyperText Transfer Protocol) é um protocolo da camada 7 — Aplicação — do modelo OSI. É nessa camada que ficam os protocolos que os aplicativos usam diretamente: HTTP, FTP, SMTP, DNS.",
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
    explicacao: "O tripé da segurança da informação é CID: Confidencialidade (acesso restrito), Integridade (dados não alterados) e Disponibilidade (acesso quando necessário). A Confidencialidade é exatamente o princípio que impede acesso não autorizado.",
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
    explicacao: "=SOMA() é a função de adição do Excel/Calc. O intervalo A1:A5 indica todas as células de A1 até A5. Para média seria =MÉDIA(), para máximo =MÁXIMO(), para contar preenchidas =CONT.VALORES().",
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
    explicacao: "O backup diferencial copia tudo que mudou desde o último backup completo — cresce a cada dia. O incremental copia só o que mudou desde o último backup (seja completo ou incremental anterior) — é menor mas a restauração é mais complexa pois exige a cadeia completa.",
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
    explicacao: "Nuvem pública é a infraestrutura de um provedor (AWS, Azure, GCP) compartilhada por múltiplos clientes via internet. Nuvem privada é de uso exclusivo de uma organização. Nuvem híbrida combina os dois modelos.",
  },
];

// Função utilitária para filtrar questões por matéria e embaralhar
export function buscarQuestoesPorNo(
  filtroMateria: string,
  quantidade: number = 5
): Questao[] {
  const filtradas = BANCO_QUESTOES.filter(
    (q) => q.materia === filtroMateria
  );
  // Embaralha e retorna a quantidade pedida
  return [...filtradas]
    .sort(() => Math.random() - 0.5)
    .slice(0, quantidade);
}
