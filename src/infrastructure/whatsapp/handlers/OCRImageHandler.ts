import { injectable, inject } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { EventLoader } from "@whatsapp/loaders/EventsLoader.js";

@injectable()
export class OCRImageHandler extends BaseHandler {
  constructor(@inject(EventLoader) private eventHandler: EventLoader) {
    super();
  }

  async handle(context: MessageContext): Promise<void> {
    if (
      context?.data?.message?.imageMessage &&
      context?.data?.message?.imageMessage.caption?.toLocaleLowerCase() ===
        "texto"
    ) {
      await this.eventHandler.handleEvent(
        "ocr-image",
        context.socket,
        context.data,
      );
      return;
    }

    return this.processNext(context);
  }
}
