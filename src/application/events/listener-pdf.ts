import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import TelegramBot from "node-telegram-bot-api";
import { BaseEvent } from "@interfaces/EventInterface";
import { LevelDB } from "@infrastructure/Storage";

export interface PDFMessageButton {
  messageId: number;
  document: string;
}

export class EventInstance extends BaseEvent {
  private readonly logger: Logger;
  private storage: LevelDB;

  constructor() {
    super("listener-pdf");
    this.logger = container.resolve(Logger);
    this.storage = container.resolve(LevelDB);
  }

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void> {
    const messageId = message.message_id;
    const document = message.document?.file_id;

    if (!document || !messageId) return;

    await this.storage.setData<PDFMessageButton>(
      "pdf-document",
      `${messageId}`,
      {
        messageId,
        document,
      },
    );

    await socket.sendMessage(
      message.chat.id,
      "O que gostaria de fazer com o PDF?",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Converter para imagem",
                callback_data: `to-image@${messageId}`,
              },
            ],
            [
              {
                text: "Converter para texto",
                callback_data: `to-text@${messageId}`,
              },
            ],
            [
              {
                text: "cancelar",
                callback_data: `to-pdf@cancel`,
              },
            ],
          ],
        },
      },
    );
  }
}
