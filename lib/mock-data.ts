import type { Post } from "./types";

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "5 coisas que voce precisa saber antes de registrar um cosmetico",
    hook: "Qual a diferenca entre Grau 1 e Grau 2 na ANVISA?",
    pilar: "educativo",
    format: "estatico",
    status: "pending",
    scheduled_date: fmt(today),
    scheduled_time: "10:00",
    caption:
      "Voce sabia que a ANVISA classifica cosmeticos em dois graus?\n\nGrau 1: produtos de baixo risco, como sabonetes e shampoos comuns.\nGrau 2: produtos com ativos especificos, como filtro solar e antiacne.\n\nA diferenca impacta diretamente no processo de regularizacao e nos prazos para lancamento.\n\nAntes de criar sua marca, entender essa classificacao pode economizar meses de trabalho.\n\n#cosmeticos #anvisa #marcapropria #gecaps #regulatorio",
    hashtags:
      "#cosmeticos #anvisa #marcapropria #gecaps #regulatorio #grau1 #grau2",
    cta: "Salve para consultar depois",
    image_url: null,
    current_version: 1,
    trello_card_id: null,
    trello_list_name: "07/04/2026",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "O maior erro de quem quer criar marca propria",
    hook: "97% desistem por causa disso...",
    pilar: "autoridade",
    format: "story",
    status: "approved",
    scheduled_date: fmt(today),
    scheduled_time: "19:00",
    caption:
      "O maior erro? Achar que precisa de fabrica propria para comecar.\n\nA realidade: com private label, voce pode lancar sua marca em 45 dias, sem investir em maquinario.\n\nA GECAPS cuida de toda a formulacao, producao e regularizacao ANVISA.\n\nVoce foca na marca. A gente faz o produto.",
    hashtags: "#marcapropria #privatelabel #gecaps #empreendedorismo",
    cta: "Arraste para saber mais",
    image_url: null,
    current_version: 2,
    trello_card_id: null,
    trello_list_name: "07/04/2026",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "O investimento real para criar sua marca de cosmeticos",
    hook: "Ninguem te conta o real custo de lancar um cosmetico",
    pilar: "autoridade",
    format: "estatico",
    status: "approved",
    scheduled_date: fmt(addDays(today, 1)),
    scheduled_time: "10:00",
    caption:
      "Vamos ser transparentes: criar uma marca propria de cosmeticos custa entre R$15mil e R$50mil.\n\nIsso inclui formulacao, testes, embalagem, rotulagem e registro ANVISA.\n\nMas aqui vai o que ninguem fala: a margem de lucro pode chegar a 300%.\n\nO investimento se paga rapido quando voce tem o produto certo para o mercado certo.",
    hashtags: "#cosmeticos #investimento #marcapropria #gecaps",
    cta: 'Comente "QUERO" para receber o guia',
    image_url: null,
    current_version: 1,
    trello_card_id: null,
    trello_list_name: "08/04/2026",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Bastidores: lote novo saindo do laboratorio",
    hook: "Quando o cliente ve a textura pela primeira vez...",
    pilar: "produto",
    format: "story",
    status: "pending",
    scheduled_date: fmt(addDays(today, 1)),
    scheduled_time: "19:00",
    caption:
      "Tem coisa melhor do que ver o produto pronto pela primeira vez?\n\nEsse lote acabou de sair do laboratorio e ja esta pronto para envase.\n\nCada detalhe: textura, cor, fragrancia, tudo desenvolvido sob medida para o cliente.\n\nIsso e o que a gente faz na GECAPS.",
    hashtags: "#bastidores #laboratorio #cosmeticos #gecaps #producao",
    cta: "Arraste para conhecer",
    image_url: null,
    current_version: 1,
    trello_card_id: null,
    trello_list_name: "08/04/2026",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Por que a formulacao importa mais que o ingrediente",
    hook: "O mesmo ingrediente. Duas formulacoes. Resultados diferentes.",
    pilar: "produto",
    format: "estatico",
    status: "rejected",
    scheduled_date: fmt(addDays(today, 2)),
    scheduled_time: "10:00",
    caption:
      "Dois seruns com Vitamina C. Mesmo percentual. Resultados completamente diferentes.\n\nPor que? A formulacao.\n\nA estabilidade do ativo, o pH, os coadjuvantes, o sistema de entrega. Tudo isso determina se o produto vai realmente funcionar na pele.\n\nPor isso a GECAPS investe tanto em P&D.",
    hashtags: "#formulacao #cosmeticos #vitaminac #gecaps #pele",
    cta: "Siga para mais conteudo",
    image_url: null,
    current_version: 1,
    trello_card_id: null,
    trello_list_name: "09/04/2026",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Dia no laboratorio",
    hook: "E quarta e o lab ja esta a todo vapor",
    pilar: "conexao",
    format: "story",
    status: "published",
    scheduled_date: fmt(addDays(today, -1)),
    scheduled_time: "19:00",
    caption:
      "Quarta-feira e dia de producao intensa aqui no lab.\n\nHoje estamos trabalhando em 3 projetos simultaneos: um serum facial, um shampoo premium e um suplemento de colageno.\n\nCada projeto tem sua historia, seu cliente, seu mercado.\n\nE a gente ama cada etapa desse processo.",
    hashtags: "#laboratorio #bastidores #gecaps #cosmeticos #rotina",
    cta: "Responda: qual produto voce criaria?",
    image_url: null,
    current_version: 1,
    trello_card_id: null,
    trello_list_name: "04/04/2026",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "7",
    title: "Frase motivacional marca propria",
    hook: "Sua marca nao comeca quando o produto fica pronto. Comeca quando voce decide.",
    pilar: "autoridade",
    format: "estatico",
    status: "published",
    scheduled_date: fmt(addDays(today, -2)),
    scheduled_time: "10:00",
    caption:
      "A decisao e o primeiro passo.\n\nA maioria das pessoas espera o momento perfeito. Mas quem ja lancou sabe: o momento perfeito e quando voce decide comecar.\n\nA GECAPS esta aqui pra transformar sua decisao em produto, marca e resultado.",
    hashtags: "#motivacao #marcapropria #empreendedorismo #gecaps",
    cta: "Marque alguem que precisa ler isso",
    image_url: null,
    current_version: 1,
    trello_card_id: null,
    trello_list_name: "03/04/2026",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function getWeekPosts(): Post[] {
  return MOCK_POSTS;
}

export function getTodayPost(): Post | undefined {
  const todayStr = fmt(today);
  return MOCK_POSTS.find(
    (p) => p.scheduled_date === todayStr && p.status === "pending"
  );
}

export function getWeekStats() {
  const approved = MOCK_POSTS.filter((p) => p.status === "approved").length;
  const pending = MOCK_POSTS.filter((p) => p.status === "pending").length;
  const rejected = MOCK_POSTS.filter((p) => p.status === "rejected").length;
  const published = MOCK_POSTS.filter((p) => p.status === "published").length;
  return { approved, pending, rejected, published, total: MOCK_POSTS.length };
}
