import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import TelegramBot from "node-telegram-bot-api";
import { BaseEvent } from "@interfaces/EventInterface";
import { isMessage } from "@utils/MessageTypeGuards";
import { TranslateClient } from "@infrastructure/TranslateClient";
/* import { LevelDB } from "@infrastructure/Storage";
import { isDev } from "@utils/isDev"; */

export class EventInstance extends BaseEvent {
  private readonly logger: Logger;

  constructor() {
    super("translate-text");
    this.logger = container.resolve(Logger);
  }

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message | TelegramBot.CallbackQuery,
  ): Promise<void> {
    if (!isMessage(message)) return;

    const messageText = message.text?.toLowerCase();
    if (!messageText) return;

    const translated = await container
      .resolve(TranslateClient)
      .translate(messageText, "pt");

    const formattedText =
      "**Mensagem traduzida: \n\n**" + "`" + translated + "`";

    await socket.sendMessage(message.chat.id, formattedText, {
      parse_mode: "Markdown",
    });
  }
}
