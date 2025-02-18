import TelegramBot from "node-telegram-bot-api";
import { Command } from "@interfaces/CommandInterface";
import { MessageUtils } from "@utils/MessageUtils";

export class CommandInstance extends Command {
  public trigger = "/ping";
  public description = "Verificar se o bot está online";

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void> {
    const bot = new MessageUtils(socket, message);

    await bot.sendReaction("🦄");

    await bot.sendText("Pong! 🏓");
  }
}
