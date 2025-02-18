import { MessageContext } from "@interfaces/MessageContext";

export abstract class BaseHandler {
  protected next: BaseHandler | null = null;

  setNext(handler: BaseHandler): BaseHandler {
    this.next = handler;
    return handler;
  }

  abstract handle(context: MessageContext): Promise<void>;

  protected async processNext(context: MessageContext): Promise<void> {
    if (this.next) {
      return this.next.handle(context);
    }
  }
}
