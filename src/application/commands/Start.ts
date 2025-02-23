import TelegramBot from "node-telegram-bot-api";
import { Command } from "@interfaces/CommandInterface";

export class CommandInstance extends Command {
  public trigger = "/start";
  public description = "Iniciar o bot";

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void> {
    const id = message.chat.id;

    await socket.sendMessage(
      id,
      "Olá! Para começar, envie /help para entender como usar o bot.",
    );
  }
}
