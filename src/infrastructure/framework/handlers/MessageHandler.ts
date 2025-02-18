import { inject, injectable } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { BotMessageHandler } from "@framework/handlers/BotMessageHandler";
import { CommandMessageHandler } from "@framework/handlers/CommandMessageHandler";
import { OCRImageHandler } from "@framework/handlers/OCRImageHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { BaseHandler } from "@framework/handlers/BaseHandler";
import { DocumentPDFHandler } from "@framework/handlers/DocumentPDFHandler";
import TelegramBot from "node-telegram-bot-api";

@injectable()
export class MessageHandler {
  private handler: BaseHandler;

  constructor(
    @inject(Logger) private logger: Logger,
    @inject(BotMessageHandler) selfMessageHandler: BotMessageHandler,
    @inject(CommandMessageHandler) commandMessageHandler: CommandMessageHandler,
    @inject(OCRImageHandler) ocrImageHandler: OCRImageHandler,
    @inject(DocumentPDFHandler) documentPDFHandler: DocumentPDFHandler,
  ) {
    this.handler = selfMessageHandler;

    selfMessageHandler
      .setNext(commandMessageHandler)
      .setNext(ocrImageHandler)
      .setNext(documentPDFHandler);
  }

  public async handleMessage(
    socket: TelegramBot,
    messages: TelegramBot.Message,
  ) {
    try {
      const context: MessageContext = {
        socket,
        data: messages,
      };

      await this.handler.handle(context);
    } catch (error) {
      this.logger.error(`Erro ao processar mensagem:`, error);
    }
  }
}
