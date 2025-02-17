import { MessageContext } from "@interfaces/MessageContext";

export abstract class BaseHandler {
  protected next: BaseHandler | null = null;

  setNext(handler: BaseHandler): BaseHandler {
    this.next = handler;
    return handler;
  }

  async handle(context: MessageContext): Promise<void> {
    if (this.next) {
      return this.next.handle(context);
    }
  }

  protected async processNext(context: MessageContext): Promise<void> {
    if (this.next) {
      return this.next.handle(context);
    }
  }
}
