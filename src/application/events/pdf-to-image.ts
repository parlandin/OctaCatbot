import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { fromBuffer } from "pdf2pic";
import TelegramBot from "node-telegram-bot-api";
import { streamToBuffer } from "@utils/BufferUtils";
import { Timer } from "@utils/Time";
import path from "path";
import os from "os";
import fs from "fs";
import { BaseEvent } from "@interfaces/EventInterface";
import { isCallbackQuery } from "@utils/MessageTypeGuards";
import { LevelDB } from "@infrastructure/Storage";
import { PDFMessageButton } from "./listener-pdf";

export class EventInstance extends BaseEvent {
  private readonly logger: Logger;

  constructor() {
    super("pdf-to-image");
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

      const storage = container.resolve(LevelDB);
      const data = await storage.getData<PDFMessageButton>(
        "pdf-document",
        extraData,
      );

      const document = data?.document;
      if (!document) return;

      const processTime = new Timer().start();
      const media = socket.getFileStream(document);
      if (!media) return;

      const buffer = await streamToBuffer(media);
      const images = await fromBuffer(buffer, {
        preserveAspectRatio: true,
        quality: 100,
        density: 150,
        compression: "JPEG",
        format: "png",
      }).bulk(-1, {
        responseType: "buffer",
      });

      const time = processTime.end();

      if (images.length <= 0) return;

      const tempDir = os.tmpdir();
      const list: TelegramBot.InputMediaPhoto[] = images.map((image, index) => {
        const filePath = path.join(tempDir, `image_${index}.png`);
        fs.writeFileSync(filePath, image.buffer as Buffer);
        return {
          type: "photo",
          media: filePath,
          caption: index === 0 ? "Documento convertido" : undefined,
        };
      });

      await socket.sendMediaGroup(message.message.chat.id, list);

      await socket.deleteMessage(
        message.message.chat.id,
        message.message.message_id,
      );

      await storage.delete("pdf-document", extraData);

      await socket.sendMessage(
        message.message.chat.id,
        `Tempo de processamento: ${time}`,
      );

      list.forEach((item) => fs.unlinkSync(item.media as string));
      return;
    } catch (error) {
      this.logger.error(" ", error);
    }
  }
}
