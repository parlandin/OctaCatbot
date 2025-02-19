import { injectable, inject } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { EventLoader } from "@framework/loaders/EventsLoader.js";
import { isMessage } from "@utils/MessageTypeGuards";

@injectable()
export class DocumentPDFHandler extends BaseHandler {
  constructor(@inject(EventLoader) private eventHandler: EventLoader) {
    super();
  }

  async handle(context: MessageContext): Promise<void> {
    if (!isMessage(context.data)) {
      return this.processNext(context);
    }

    if (context?.data?.document?.mime_type === "application/pdf") {
      console.log("PDF RECEIVED", context.data.document);
      await this.eventHandler.handleEvent(
        "listener-pdf",
        context.socket,
        context.data,
      );
      return;
    }

    return this.processNext(context);
  }
}
