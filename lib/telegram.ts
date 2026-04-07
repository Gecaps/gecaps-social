const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramMessage(text: string) {
  if (!BOT_TOKEN || !CHAT_ID) return;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  });
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
