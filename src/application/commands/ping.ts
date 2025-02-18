import TelegramBot from "node-telegram-bot-api";

export const command = "/ping";

export async function execute(
  socket: TelegramBot,
  message: TelegramBot.Message,
) {
  const id = message.chat.id;
  await socket.sendMessage(id, "Pong! 🏓");
}
