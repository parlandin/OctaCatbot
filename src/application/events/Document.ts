//application/pdf
//application/msword

import { WAMessage, WASocket } from "@whiskeysockets/baileys";
import { container } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";

import { reactMessage, replyMessage } from "@utils/quoteMessage";

export const event = "document";

export async function execute(socket: WASocket, message: WAMessage) {
  const logger = container.resolve(Logger);

  try {
    if (!message.key.remoteJid) return;
    if (!message.message?.documentMessage) return;

    await reactMessage(socket, message, "⏳");

    await replyMessage(socket, message, {
      text: "documento recebido: " + message.message.documentMessage.mimetype,
    });
  } catch (error) {
    logger.error(" ", error);
  }
}
