import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { isDev } from "@utils/isDev.js";
import Tesseract from "tesseract.js";
import TelegramBot from "node-telegram-bot-api";
import { streamToBuffer, textToBuffer } from "@utils/BufferUtils";
import { MessageUtils } from "@utils/MessageUtils";
import { BaseEvent } from "@interfaces/EventInterface";

export class EventInstance extends BaseEvent {
  private readonly logger: Logger;
  private readonly MAX_TEXT_LENGTH = 600;

  constructor() {
    super("ocr-image");
    this.logger = container.resolve(Logger);
  }

  public async execute(
    socket: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void> {
    try {
      if (!this.hasValidPhoto(message)) return;

      const photo = this.getLastPhoto(message);
      if (!photo) return;

      const bot = new MessageUtils(socket, message);
      const text = await this.extractTextFromPhoto(socket, photo.file_id);

      if (!text) {
        await this.handleNoTextFound(bot);
        return;
      }

      await this.sendExtractedText(bot, text);
      this.logSuccess();
    } catch (error) {
      this.logger.error("Erro ao extrair imagem: ", error);
    }
  }

  private hasValidPhoto(message: TelegramBot.Message): boolean {
    return Boolean(message.photo && message.photo.length > 0);
  }

  private getLastPhoto(
    message: TelegramBot.Message,
  ): TelegramBot.PhotoSize | undefined {
    return message.photo?.at(-1);
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
