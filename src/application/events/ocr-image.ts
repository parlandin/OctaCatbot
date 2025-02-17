import {
  WAMessage,
  WASocket,
  downloadMediaMessage,
} from "@whiskeysockets/baileys";
import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { isDev } from "@utils/isDev.js";
import Tesseract from "tesseract.js";
import { reactMessage, replyMessage } from "@utils/quoteMessage";

export const event = "ocr-image";

export async function execute(socket: WASocket, message: WAMessage) {
  const logger = container.resolve(Logger);

  try {
    if (!message.key.remoteJid) return;
    if (!message.message?.imageMessage) return;

    await reactMessage(socket, message, "⏳");

    const media = await downloadMediaMessage(message, "buffer", {});
    if (!media) {
      if (isDev) {
        logger.warn("Mídia não encontrada!");
      }
      return;
    }

    const { data } = await Tesseract.recognize(media, "por+eng");

    if (!data.text) {
      await replyMessage(socket, message, {
        text: "Não foi possível extrair texto da imagem!",
      });

      if (isDev) {
        logger.warn("Não foi possível extrair texto da imagem!");
      }
      return;
    }

    await replyMessage(socket, message, {
      text: data.text,
    });

    if (isDev) {
      logger.info("Texto extraído da imagem com sucesso!");
    }
  } catch (error) {
    logger.error("Erro ao extrair imagem: ", error);
  }
}
