import { injectable, inject } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { EventHandler } from "@whatsapp/handlers/EventHandler.js";

@injectable()
export class StickerHandler extends BaseHandler {
  constructor(@inject(EventHandler) private eventHandler: EventHandler) {
    super();
  }

  async handle(context: MessageContext): Promise<void> {
    await this.eventHandler.handleEvent(
      "stick",
      context.socket,
      context.message,
    );
  }
}
