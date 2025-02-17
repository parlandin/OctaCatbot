import { injectable, inject } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { EventLoader } from "@whatsapp/loaders/EventsLoader.js";

@injectable()
export class documentHandler extends BaseHandler {
  constructor(@inject(EventLoader) private eventHandler: EventLoader) {
    super();
  }

  async handle(context: MessageContext): Promise<void> {
    if (context?.message?.message?.documentMessage) {
      await this.eventHandler.handleEvent(
        "document",
        context.socket,
        context.message,
      );
      return;
    }

    return this.processNext(context);
  }
}
