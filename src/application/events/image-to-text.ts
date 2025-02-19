import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { isDev } from "@utils/isDev.js";
import Tesseract from "tesseract.js";
import TelegramBot from "node-telegram-bot-api";
import { streamToBuffer, textToBuffer } from "@utils/BufferUtils";
import { MessageUtils } from "@utils/MessageUtils";
import { BaseEvent } from "@interfaces/EventInterface";
import { isCallbackQuery } from "@utils/MessageTypeGuards";
import { ImageMessageButton } from "./listener-imagem";
import { LevelDB } from "@infrastructure/Storage";

export class EventInstance extends BaseEvent {
  private readonly logger: Logger;
  private readonly MAX_TEXT_LENGTH = 600;

  constructor() {
    super("image-to-text");
    this.logger = container.resolve(Logger);
  }

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message | TelegramBot.CallbackQuery,
    extraData?: string,
  ): Promise<void> {
    try {
      if (!isCallbackQuery(message)) return;
      if (!message.message) return;
      if (!extraData) return;

      const bot = new MessageUtils(socket, message);

      const storage = container.resolve(LevelDB);
      const data = await storage.getData<ImageMessageButton>(
        "image-file",
        extraData,
      );

      const photos = data?.photos;
      if (!photos || photos.length <= 0) return;

      const photo = this.getLastPhoto(photos);
      if (!photo) return;

      const text = await this.extractTextFromPhoto(socket, photo.file_id);

      if (!text) {
        await this.handleNoTextFound(bot);
        return;
      }

      await this.sendExtractedText(bot, text);

      await socket.deleteMessage(
        message.message.chat.id,
        message.message.message_id,
      );

      await storage.delete("image-file", extraData);

      this.logSuccess();
    } catch (error) {
      this.logger.error("Erro ao extrair imagem: ", error);
    }
  }

  private getLastPhoto(
    message: TelegramBot.PhotoSize[],
  ): TelegramBot.PhotoSize | undefined {
    return message.at(-1);
  }

  private async extractTextFromPhoto(
    socket: TelegramBot,
    fileId: string,
  ): Promise<string | null> {
    const media = socket.getFileStream(fileId);
    const buffer = await streamToBuffer(media);
    const { data } = await Tesseract.recognize(buffer, "por+eng");
    return data.text || null;
  }

  private async handleNoTextFound(bot: MessageUtils): Promise<void> {
    await bot.sendText("Não foi possível extrair texto da imagem!");
    if (isDev) {
      this.logger.warn("Não foi possível extrair texto da imagem!");
    }
  }

  private async sendExtractedText(
    bot: MessageUtils,
    text: string,
  ): Promise<void> {
    if (text.length <= this.MAX_TEXT_LENGTH) {
      await this.sendShortText(bot, text);
    } else {
      await this.sendLongText(bot, text);
    }
  }

  private async sendShortText(bot: MessageUtils, text: string): Promise<void> {
    const formattedText = "**texto extraído: \n\n**" + "`" + text + "`";
    await bot.sendMarkdown(formattedText);
  }

  private async sendLongText(bot: MessageUtils, text: string): Promise<void> {
    const buffer = textToBuffer(text);
    await bot.sendDocument(
      buffer,
      "texto-extraído",
      {},
      {
        filename: "texto-extraído",
        contentType: "text/plain",
      },
    );
  }

  private logSuccess(): void {
    if (isDev) {
      this.logger.info("Texto extraído da imagem com sucesso!");
    }
  }
}
