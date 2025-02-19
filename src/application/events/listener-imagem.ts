import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import TelegramBot from "node-telegram-bot-api";
import { BaseEvent } from "@interfaces/EventInterface";
import { LevelDB } from "@infrastructure/Storage";

export interface ImageMessageButton {
  messageId: number;
  photos: TelegramBot.PhotoSize[];
}

export class EventInstance extends BaseEvent {
  private readonly logger: Logger;
  private storage: LevelDB;

  constructor() {
    super("listener-image");
    this.logger = container.resolve(Logger);
    this.storage = container.resolve(LevelDB);
  }

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void> {
    const messageId = message.message_id;
    const photos = message.photo;

    if (!messageId) return;
    if (!photos || photos.length <= 0) return;

    await this.storage.setData<ImageMessageButton>(
      "image-file",
      `${messageId}`,
      {
        messageId,
        photos,
      },
    );

    await socket.sendMessage(
      message.chat.id,
      "O que gostaria de fazer com a imagem?",
      {
        reply_to_message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Converter para texto",
                callback_data: `image-to-text@${messageId}`,
              },
            ],
            [
              {
                text: "traduzir e enviar como texto ",
                callback_data: `image-to-translated-text@${messageId}`,
              },
            ],
            [
              {
                text: "cancelar",
                callback_data: `image-cancel@${messageId}`,
              },
            ],
          ],
        },
      },
    );
  }
}
