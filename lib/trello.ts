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

// Parse list name as date — extracts DD/MM/YYYY from anywhere in the name
// Handles: "02/04/2026 Embaixador", "Post 01/04/2026", "05/04/2026 Suplemento/ Curcuma"
export function parseListDate(listName: string): string | null {
  const match = listName.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

// Extract topic/theme from list name (after the date)
// "05/04/2026 Suplemento/ Curcuma" → "Suplemento/ Curcuma"
export function parseListTopic(listName: string): string {
  return listName.replace(/^.*?\d{2}\/\d{2}\/\d{4}\s*/, "").trim() || "";
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
