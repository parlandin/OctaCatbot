import TelegramBot from "node-telegram-bot-api";
import { Command } from "@interfaces/CommandInterface";
import { MessageUtils } from "@utils/MessageUtils";

export class CommandInstance extends Command {
  public trigger = "/button";
  public description = "Ver um botão";

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void> {
    const bot = new MessageUtils(socket, message);

    await bot.sendReaction("🦄");

    await socket.sendMessage(message.chat.id, "escolha uma opção", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Opção 1", callback_data: "opcao1" },
            { text: "Opção 2", callback_data: "opcao2" },
          ],
        ],
      },
    });
  }
}
