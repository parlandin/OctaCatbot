import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { isDev } from "@utils/isDev.js";
import Tesseract from "tesseract.js";
import TelegramBot from "node-telegram-bot-api";
import { streamToBuffer, textToBuffer } from "@utils/BufferUtils";
import { MessageUtils } from "@utils/MessageUtils";

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

    const bot = new MessageUtils(socket, message);

    const media = socket.getFileStream(photo.file_id);
    const buffer = await streamToBuffer(media);

    const { data } = await Tesseract.recognize(buffer, "por+eng");

    if (!data.text) {
      await bot.sendText("Não foi possível extrair texto da imagem!");

      if (isDev) {
        logger.warn("Não foi possível extrair texto da imagem!");
      }
      return;
    }

    if (data.text.length <= 600) {
      await bot.sendText(data.text);
    }

    if (data.text.length >= 601) {
      const text = textToBuffer(data.text);
      await bot.sendDocument(
        text,
        "texto-extraído",
        {},
        {
          filename: "texto-extraído",
          contentType: "text/plain",
        },
      );
    }

    if (isDev) {
      logger.info("Texto extraído da imagem com sucesso!");
    }
  } catch (error) {
    logger.error("Erro ao extrair imagem: ", error);
  }
}
