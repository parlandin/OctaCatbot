import { injectable, inject } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { CommandLoader } from "@framework/loaders/CommandsLoader.js";
import { isMessage } from "@utils/MessageTypeGuards";

@injectable()
export class CommandMessageHandler extends BaseHandler {
  constructor(@inject(CommandLoader) private commandHandler: CommandLoader) {
    super();
  }

  async handle(context: MessageContext): Promise<void> {
    if (!isMessage(context.data)) {
      return this.processNext(context);
    }

    if (context.data.text && context.data.text.startsWith("/")) {
      await this.commandHandler.executeCommand(
        context.data.text.trim(),
        context.socket,
        context.data,
      );
      return;
    }

    return this.processNext(context);
  }
}
