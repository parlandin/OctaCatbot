import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { isDev } from "@utils/isDev.js";
import Tesseract from "tesseract.js";
import TelegramBot from "node-telegram-bot-api";
import { streamToBuffer } from "@utils/streamToBuffer";

export const event = "ocr-image";

export async function execute(
  socket: TelegramBot,
  message: TelegramBot.Message,
) {
  const logger = container.resolve(Logger);

  try {
    if (!message.photo || message.photo.length <= 0) return;

    const photo = message.photo.at(-1);
    if (!photo) return;

    const media = socket.getFileStream(photo.file_id);
    const buffer = await streamToBuffer(media);

    const { data } = await Tesseract.recognize(buffer, "por+eng");

    if (!data.text) {
      await socket.sendMessage(
        message.chat.id,
        "Não foi possível extrair texto da imagem!",
      );

      if (isDev) {
        logger.warn("Não foi possível extrair texto da imagem!");
      }
      return;
    }

    await socket.sendMessage(message.chat.id, data.text);

    if (isDev) {
      logger.info("Texto extraído da imagem com sucesso!");
    }
  } catch (error) {
    logger.error("Erro ao extrair imagem: ", error);
  }
}
