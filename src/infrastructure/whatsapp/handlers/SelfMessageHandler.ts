import { injectable } from "tsyringe";
import { BaseHandler } from "@whatsapp/handlers/BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";

@injectable()
export class SelfMessageHandler extends BaseHandler {
  async handle(context: MessageContext): Promise<void> {
    if (context.data.key.fromMe || !context.data.message) {
      return;
    }

    return this.processNext(context);
  }
}
