import { injectable, inject } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { EventLoader } from "@framework/loaders/EventsLoader.js";

@injectable()
export class OCRImageHandler extends BaseHandler {
  constructor(@inject(EventLoader) private eventHandler: EventLoader) {
    super();
  }

  async handle(context: MessageContext): Promise<void> {
    if (
      context?.data?.photo &&
      context.data.photo.length > 0 &&
      context?.data?.caption?.toLocaleLowerCase() === "texto"
    ) {
      await this.eventHandler.handleEvent(
        "image-to-text",
        context.socket,
        context.data,
      );
      return;
    }

    return this.processNext(context);
  }
}
