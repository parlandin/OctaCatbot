import { inject, injectable } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { BotMessageHandler } from "@framework/handlers/BotMessageHandler";
import { CommandMessageHandler } from "@framework/handlers/CommandMessageHandler";
import { ImageHandler } from "@framework/handlers/ImageHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { BaseHandler } from "@framework/handlers/BaseHandler";
import { DocumentPDFHandler } from "@framework/handlers/DocumentPDFHandler";
import TelegramBot from "node-telegram-bot-api";
import { CallbackPDFHandle } from "./CallbackPDFHandle";
import { CallBackImageHandle } from "./CallBackImageHandle";

@injectable()
export class MessageHandler {
  private handler: BaseHandler;

  constructor(
    @inject(Logger) private logger: Logger,
    @inject(BotMessageHandler) selfMessageHandler: BotMessageHandler,
    @inject(CommandMessageHandler) commandMessageHandler: CommandMessageHandler,
    @inject(ImageHandler) imageHandler: ImageHandler,
    @inject(DocumentPDFHandler) documentPDFHandler: DocumentPDFHandler,
    @inject(CallbackPDFHandle) callbackPDFHandle: CallbackPDFHandle,
    @inject(CallBackImageHandle) callBackImageHandle: CallBackImageHandle,
  ) {
    this.handler = selfMessageHandler;

    selfMessageHandler
      .setNext(commandMessageHandler)
      .setNext(imageHandler)
      .setNext(documentPDFHandler)
      .setNext(callbackPDFHandle)
      .setNext(callBackImageHandle);
  }

  public async handleMessage(
    socket: TelegramBot,
    messages: TelegramBot.Message | TelegramBot.CallbackQuery,
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
