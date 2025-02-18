import TelegramBot from "node-telegram-bot-api";
import { Command } from "@interfaces/CommandInterface";
import { MessageUtils } from "@utils/MessageUtils";

export class CommandInstance extends Command {
  public trigger = "/help";
  public description = "Explica como usar o bot";

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void> {
    const bot = new MessageUtils(socket, message);
    await bot.sendText(
      "Olá! Eu sou um bot que pode te ajudar a converter arquivos, extrair texto de imagens, e muito mais!",
    );

    await bot.sendMarkdown(
      "O bot suporta as  seguintes funções: \n\n" +
        "- Documentos PDF → DOCX\n" +
        "- Imagens → Texto \n" +
        "- Documentos PDF → Imagens\n" +
        "- Documentos DOCX → PDF\n",
    );
  }
}
