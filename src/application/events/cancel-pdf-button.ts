import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import TelegramBot from "node-telegram-bot-api";
import { BaseEvent } from "@interfaces/EventInterface";
import { isCallbackQuery } from "@utils/MessageTypeGuards";
import { LevelDB } from "@infrastructure/Storage";
import { PDFMessageButton } from "./listener-pdf";

export class EventInstance extends BaseEvent {
  private readonly logger: Logger;

  constructor() {
    super("pdf-cancel");
    this.logger = container.resolve(Logger);
  }

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message | TelegramBot.CallbackQuery,
    extraData?: string,
  ): Promise<void> {
    if (isCallbackQuery(message)) {
      if (!extraData) return;
      if (!message.message) return;

      const storage = container.resolve(LevelDB);
      const data = await storage.getData<PDFMessageButton>(
        "pdf-document",
        extraData,
      );

      if (!data) {
        socket.sendMessage(message.message.chat.id, "Cancelado");
        return;
      }

      await storage.delete("pdf-document", extraData);
      await socket.deleteMessage(
        message.message.chat.id,
        message.message.message_id,
      );
      await socket.sendMessage(message.message.chat.id, "Cancelado!");
    }
  }
}
