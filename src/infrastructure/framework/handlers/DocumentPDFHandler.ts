import { injectable, inject } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { EventLoader } from "@framework/loaders/EventsLoader.js";

@injectable()
export class DocumentPDFHandler extends BaseHandler {
  constructor(@inject(EventLoader) private eventHandler: EventLoader) {
    super();
  }

  async handle(context: MessageContext): Promise<void> {
    if (context?.data?.document?.mime_type === "application/pdf") {
      if (!context.data.caption) return;

      if (context.data.caption.toLocaleLowerCase() === "imagem") {
        await this.eventHandler.handleEvent(
          "pdf-to-image",
          context.socket,
          context.data,
        );
        return;
      }
    }

    return this.processNext(context);
  }
}
