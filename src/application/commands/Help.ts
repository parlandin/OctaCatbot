import TelegramBot from "node-telegram-bot-api";
import { Command } from "@interfaces/CommandInterface";

export class CommandInstance extends Command {
  public trigger = "/help";
  public description = "Explica como usar o bot";

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void> {
    const id = message.chat.id;
    await socket.sendMessage(
      id,
      "Para usar o bot, envie um arquivo com a descrição do que deseja fazer. O bot irá processar o arquivo e responder com o resultado.",
    );
  }
}
