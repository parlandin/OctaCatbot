//application/pdf
//application/msword

import {
  downloadMediaMessage,
  WAMessage,
  WASocket,
} from "@whiskeysockets/baileys";
import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { fromBuffer } from "pdf2pic";

import { reactMessage, replyMessage } from "@utils/quoteMessage";

export const event = "document";

export async function execute(socket: WASocket, message: WAMessage) {
  const logger = container.resolve(Logger);

  try {
    if (!message.key.remoteJid) return;
    if (!message.message?.documentMessage) return;

    await reactMessage(socket, message, "⏳");

    if (message.message.documentMessage.mimetype == "application/pdf") {
      const media = await downloadMediaMessage(message, "buffer", {});

      if (!media) {
        logger.warn("Mídia não encontrada!");
        return;
      }

      const images = await fromBuffer(media, {
        preserveAspectRatio: true,
        quality: 90,
        density: 90,
        compression: "JPEG",
        format: "png",
      }).bulk(-1, {
        responseType: "buffer",
      });

      if (images.length <= 0) return;

      for (const image of images) {
        if (!image.buffer) continue;
        await replyMessage(socket, message, {
          image: image.buffer,
        });
      }

      return;
    }

    await reactMessage(socket, message, "⏳");

    await replyMessage(socket, message, {
      text: "documento recebido: " + message.message.documentMessage.mimetype,
    });
  } catch (error) {
    logger.error(" ", error);
  }
}
