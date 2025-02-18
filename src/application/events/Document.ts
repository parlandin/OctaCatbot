import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { fromBuffer } from "pdf2pic";
import TelegramBot from "node-telegram-bot-api";
import { streamToBuffer } from "@utils/BufferUtils";
import { Timer } from "@utils/Time";
import path from "path";
import os from "os";
import fs from "fs";

export const event = "document";

export async function execute(
  socket: TelegramBot,
  message: TelegramBot.Message,
) {
  const logger = container.resolve(Logger);

  try {
    if (!message.document) return;

    const processTime = new Timer().start();

    const media = socket.getFileStream(message.document.file_id);

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

    await socket.sendMediaGroup(message.chat.id, list, {
      reply_to_message_id: message.message_id,
    });

    await socket.sendMessage(
      message.chat.id,
      `Tempo de processamento: ${time}`,
    );

    list.forEach((item) => fs.unlinkSync(item.media as string));

    return;
  } catch (error) {
    logger.error(" ", error);
  }
}
