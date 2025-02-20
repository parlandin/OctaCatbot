import TelegramBot from "node-telegram-bot-api";
import { Command } from "@interfaces/CommandInterface";
import { MessageUtils } from "@utils/MessageUtils";
import { container } from "tsyringe";
import { LevelDB } from "@infrastructure/Storage";

export class CommandInstance extends Command {
  public trigger = "/traduzir";
  public description = "Traduzir  do inglês para o português";

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void> {
    const bot = new MessageUtils(socket, message);

    await bot.sendReaction("🦄");

    const storage = container.resolve(LevelDB);

    await storage.setData(
      "pending-translation",
      message.chat.id.toString(),
      true,
    );

    await bot.sendText(
      "Envie a mensagem que deseja traduzir  do inglês para o português",
    );
  }
}
