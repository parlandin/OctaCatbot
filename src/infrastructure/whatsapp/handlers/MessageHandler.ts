import { inject, injectable } from "tsyringe";
import { WASocket, WAMessage } from "@whiskeysockets/baileys";
import { CommandHandler } from "@infrastructure/whatsapp/handlers/CommandHandler.js";
import { EventHandler } from "@infrastructure/whatsapp/handlers/EventHandler.js";
import { Logger } from "@infrastructure/Logger.js";

@injectable()
export class MessageHandler {
  constructor(
    @inject(CommandHandler) private commandHandler: CommandHandler,
    @inject(EventHandler) private eventHandler: EventHandler,
    @inject(Logger) private logger: Logger,
  ) {}

  public async handleMessage(socket: WASocket, messages: WAMessage[]) {
    try {
      for (const msg of messages) {
        if (msg.key.fromMe || !msg.message) continue;
        const remoteJid = msg.key.remoteJid as string;
        const messageContent =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          "";

        if (!messageContent) return;

        if (messageContent.startsWith("/")) {
          await this.commandHandler.executeCommand(
            messageContent.trim(),
            socket,
            remoteJid,
          );
        } else {
          await this.eventHandler.handleEvent("message", socket, msg);
        }
      }
    } catch (error) {
      this.logger.error(`Erro ao processar mensagem:`, error);
    }
  }
}
