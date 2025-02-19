import { injectable, inject } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { EventLoader } from "@framework/loaders/EventsLoader.js";
import { isCallbackQuery } from "@utils/MessageTypeGuards";

@injectable()
export class CallbackPDFHandle extends BaseHandler {
  constructor(@inject(EventLoader) private eventHandler: EventLoader) {
    super();
  }

  async handle(context: MessageContext): Promise<void> {
    if (isCallbackQuery(context.data)) {
      if (!context.data.data) return this.processNext(context);

      const [type, opt] = context.data.data.split("@");

      if (!type || !opt) return this.processNext(context);

      if (type === "to-image") {
        await this.eventHandler.handleEvent(
          "pdf-to-image",
          context.socket,
          context.data,
          opt,
        );

        return;
      }

      if (type == "cancel") {
        await this.eventHandler.handleEvent(
          "cancel-pdf",
          context.socket,
          context.data,
          opt,
        );
        return;
      }
    }

    return this.processNext(context);
  }
}
