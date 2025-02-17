import { injectable, inject } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { EventLoader } from "@whatsapp/loaders/EventsLoader.js";

@injectable()
export class StickerHandler extends BaseHandler {
  constructor(@inject(EventLoader) private eventHandler: EventLoader) {
    super();
  }

  async handle(context: MessageContext): Promise<void> {
    if (context?.data?.message?.imageMessage) {
      await this.eventHandler.handleEvent(
        "stick",
        context.socket,
        context.data,
      );
    }

    return this.processNext(context);
  }
}
