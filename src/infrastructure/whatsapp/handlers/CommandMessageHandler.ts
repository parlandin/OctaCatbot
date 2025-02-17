import { injectable, inject } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { CommandHandler } from "@whatsapp/handlers/CommandHandler.js";

@injectable()
export class CommandMessageHandler extends BaseHandler {
  constructor(@inject(CommandHandler) private commandHandler: CommandHandler) {
    super();
  }

  async handle(context: MessageContext): Promise<void> {
    if (context.messageContent.startsWith("/")) {
      await this.commandHandler.executeCommand(
        context.messageContent.trim(),
        context.socket,
        context.remoteJid,
      );
      return;
    }

    return this.processNext(context);
  }
}
