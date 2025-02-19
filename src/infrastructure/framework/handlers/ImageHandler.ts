import { injectable, inject } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { EventLoader } from "@framework/loaders/EventsLoader.js";
import { isMessage } from "@utils/MessageTypeGuards";

@injectable()
export class ImageHandler extends BaseHandler {
  constructor(@inject(EventLoader) private eventHandler: EventLoader) {
    super();
  }

  async handle(context: MessageContext): Promise<void> {
    if (!isMessage(context.data)) {
      return this.processNext(context);
    }
    if (context?.data?.photo && context.data.photo.length > 0) {
      if (context.data.media_group_id) return this.processNext(context);

      await this.eventHandler.handleEvent(
        "listener-image",
        context.socket,
        context.data,
      );
      return;
    }

    return this.processNext(context);
  }
}
