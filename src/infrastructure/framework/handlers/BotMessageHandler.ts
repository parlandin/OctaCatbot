import { injectable } from "tsyringe";
import { BaseHandler } from "@framework/handlers/BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";

@injectable()
export class BotMessageHandler extends BaseHandler {
  async handle(context: MessageContext): Promise<void> {
    if (context.data.from?.is_bot) {
      return;
    }

    return this.processNext(context);
  }
}
