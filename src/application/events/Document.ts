import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { fromBuffer } from "pdf2pic";
import TelegramBot from "node-telegram-bot-api";
import { streamToBuffer } from "@utils/streamToBuffer";

export const event = "document";

export async function execute(
  socket: TelegramBot,
  message: TelegramBot.Message,
) {
  const logger = container.resolve(Logger);

  try {
    if (!message.document) return;

    const media = socket.getFileStream(message.document.file_id);
    const name = message.document.file_name;

    if (!media) return;

    const buffer = await streamToBuffer(media);

    const images = await fromBuffer(buffer, {
      preserveAspectRatio: true,
      quality: 100,
      density: 95,
      compression: "JPEG",
      format: "png",
    }).bulk(-1, {
      responseType: "buffer",
    });

    if (images.length <= 0) return;

    for (const image of images) {
      if (!image.buffer) continue;
      await socket.sendPhoto(
        message.chat.id,
        image.buffer,
        {
          caption: "Documento convertido",
        },
        {
          filename: `documento-${name}.png`,
          contentType: "image/png",
        },
      );
    }

    return;
  } catch (error) {
    logger.error(" ", error);
  }
}
