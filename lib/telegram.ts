import type { PieceStatus } from "@/modules/accounts/types";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://social.gecaps.com.br";

export async function sendTelegramMessage(text: string) {
  if (!BOT_TOKEN || !CHAT_ID) return;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.error("Telegram send failed:", err);
  }
}

export async function notifyPostReady(title: string, date: string, url: string) {
  await sendTelegramMessage(
    `📱 <b>Post pronto pra revisar!</b>\n\n` +
    `<b>${title}</b>\n` +
    `📅 ${date}\n\n` +
    `👉 <a href="${url}">Abrir no painel</a>`
  );
}

export async function notifyPostApproved(title: string) {
  await sendTelegramMessage(
    `✅ <b>Post aprovado!</b>\n${title}`
  );
}

interface PieceNotification {
  id: string;
  title: string;
  account_id: string;
  format?: string | null;
  scheduled_date?: string | null;
}

function pieceUrl(p: PieceNotification): string {
  return `${BASE_URL}/${p.account_id}/pecas/${p.id}`;
}

export async function notifyStatusChange(
  piece: PieceNotification,
  from: PieceStatus,
  to: PieceStatus
): Promise<void> {
  if (from === to) return;
  const url = pieceUrl(piece);
  const title = piece.title || "(sem título)";

  let text: string | null = null;
  switch (to) {
    case "in_production":
      text =
        `🎨 <b>Peça em produção</b>\n` +
        `<b>${title}</b>\n\n` +
        `👉 <a href="${url}">Abrir editor</a>`;
      break;
    case "final_approved":
      text =
        `✅ <b>Peça aprovada!</b>\n` +
        `<b>${title}</b>\n\n` +
        `👉 <a href="${url}">Ver peça</a>`;
      break;
    case "scheduled":
      text =
        `📅 <b>Peça agendada</b>\n` +
        `<b>${title}</b>\n` +
        (piece.scheduled_date ? `🗓 ${piece.scheduled_date}\n` : "") +
        `\n👉 <a href="${url}">Ver peça</a>`;
      break;
    case "published":
      text =
        `🚀 <b>Post publicado!</b>\n` +
        `<b>${title}</b>\n\n` +
        `👉 <a href="${url}">Ver peça</a>`;
      break;
    case "rejected":
      text =
        `❌ <b>Peça rejeitada</b>\n` +
        `<b>${title}</b>\n\n` +
        `👉 <a href="${url}">Abrir peça</a>`;
      break;
    case "idea_approved":
      text =
        `💡 <b>Ideia aprovada — pronta para produção</b>\n` +
        `<b>${title}</b>\n\n` +
        `👉 <a href="${url}">Iniciar peça</a>`;
      break;
    default:
      return;
  }

  await sendTelegramMessage(text);
}
