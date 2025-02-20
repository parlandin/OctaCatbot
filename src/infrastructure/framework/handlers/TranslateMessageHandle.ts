import { inject, injectable } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { isMessage } from "@utils/MessageTypeGuards";
import { LevelDB } from "@infrastructure/Storage";
import { EventLoader } from "@framework/loaders/EventsLoader";

@injectable()
export class TranslateMessageHandle extends BaseHandler {
  constructor(
    @inject(LevelDB) private store: LevelDB,
    @inject(EventLoader) private eventHandler: EventLoader,
  ) {
    super();
  }

  async handle(context: MessageContext): Promise<void> {
    if (!isMessage(context.data)) {
      return this.processNext(context);
    }

    const chatId = context.data?.chat.id;
    if (!chatId) return this.processNext(context);

    const haPendentTranslation = await this.store.getData<boolean>(
      "pending-translation",
      chatId.toString(),
    );

    if (haPendentTranslation) {
      await this.store.delete("pending-translation", chatId.toString());
      await this.eventHandler.handleEvent(
        "translate-text",
        context.socket,
        context.data,
      );
      return;
    }

    return this.processNext(context);
  }
}
