import {
  WAMessage,
  WASocket,
  downloadMediaMessage,
} from "@whiskeysockets/baileys";
import sharp from "sharp";
import { container } from "tsyringe";
import { Logger } from "../../infrastructure/Logger";
import { isDev } from "../../shared/utils/isDev";

export const event = "message";

export async function execute(socket: WASocket, message: WAMessage) {
  const logger = container.resolve(Logger);
  try {
    if (!message.message?.imageMessage) return;

    const media = await downloadMediaMessage(message, "buffer", {});
    if (!media) {
      if (isDev) {
        logger.warn("Mídia não encontrada!");
      }
      return;
    }

    const webpBuffer = await sharp(media).toFormat("webp").toBuffer();

    if (!message.key.remoteJid) return;

    await socket.sendMessage(
      message.key.remoteJid,
      {
        sticker: webpBuffer,
      },
      {
        quoted: message,
      },
    );

    if (isDev) {
      logger.info("Sticker enviado com sucesso!");
    }
  } catch (error) {
    logger.error("Erro ao enviar sticker: ", error);
  }
}
