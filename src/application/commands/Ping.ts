import TelegramBot from "node-telegram-bot-api";
import { Command } from "@interfaces/CommandInterface";

export class CommandInstance extends Command {
  public trigger = "/ping";
  public description = "Verificar se o bot está online";

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void> {
    const id = message.chat.id;
    await socket.sendMessage(id, "Pong! 🏓");
  }
}
