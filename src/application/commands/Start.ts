import TelegramBot from "node-telegram-bot-api";

export const command = "/start";
export const description = "Iniciar o bot";

export async function execute(
  socket: TelegramBot,
  message: TelegramBot.Message,
) {
  const id = message.chat.id;
  await socket.sendMessage(
    id,
    "Olá! Para começar, envie /help para entender como usar o bot.",
  );
}
