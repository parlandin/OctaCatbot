import {
  WAMessage,
  WASocket,
  downloadMediaMessage,
} from "@whiskeysockets/baileys";
import sharp from "sharp";
import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { isDev } from "@utils/isDev.js";
import { reactMessage, replyMessage } from "@utils/quoteMessage";

export const event = "stick";

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

    const webpBuffer = await sharp(media).toFormat("webp").toBuffer();

    await replyMessage(socket, message, {
      sticker: webpBuffer,
    });

    if (isDev) {
      logger.info("Sticker enviado com sucesso!");
    }
  } catch (error) {
    logger.error("Erro ao enviar sticker: ", error);
  }
}
