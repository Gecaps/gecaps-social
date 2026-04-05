const TRELLO_API = "https://api.trello.com/1";

function auth() {
  return `key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`;
}

export async function getTrelloLists(boardId: string) {
  const res = await fetch(
    `${TRELLO_API}/boards/${boardId}/lists?${auth()}&cards=open&card_fields=name,desc,labels`
  );
  if (!res.ok) throw new Error(`Trello API error: ${res.status}`);
  return res.json();
}

export async function getTrelloCards(listId: string) {
  const res = await fetch(
    `${TRELLO_API}/lists/${listId}/cards?${auth()}&fields=name,desc,labels`
  );
  if (!res.ok) throw new Error(`Trello API error: ${res.status}`);
  return res.json();
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  labels: { name: string; color: string }[];
}

export interface TrelloList {
  id: string;
  name: string;
  cards: TrelloCard[];
}

// Parse list name as date (DD/MM/YYYY format from Aline's board)
export function parseListDate(listName: string): string | null {
  const match = listName.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

// Map Trello label to pilar
export function labelToPilar(
  labels: { name: string; color: string }[]
): string {
  const map: Record<string, string> = {
    educativo: "educativo",
    autoridade: "autoridade",
    produto: "produto",
    conexao: "conexao",
    "social proof": "social-proof",
    objecao: "objecao",
  };

  for (const label of labels) {
    const key = label.name.toLowerCase();
    if (map[key]) return map[key];
  }
  return "educativo";
}
