import { injectable } from "tsyringe";
import { BaseHandler } from "./BaseHandler";
import { MessageContext } from "@interfaces/MessageContext";
import { isMessage, isCallbackQuery } from "@utils/MessageTypeGuards";

@injectable()
export class RejectionNotCaughtHandle extends BaseHandler {
  async handle(context: MessageContext): Promise<void> {
    if (!isMessage(context.data)) {
      return this.processNext(context);
    }
    let chatid: number | undefined;
    let messageid: number | undefined;

    if (isMessage(context.data)) {
      chatid = context.data.chat.id;
      messageid = context.data.message_id;
    }

    if (isCallbackQuery(context.data)) {
      chatid = context.data?.message?.chat.id;
      messageid = context.data?.message?.message_id;
    }

    if (!chatid || !messageid) return this.processNext(context);

    await context.socket.sendMessage(
      chatid,
      "Algo deu errado, por favor, verifique como funciona em /help e tente novamente.",
      {
        reply_to_message_id: messageid,
      },
    );

    return this.processNext(context);
  }
}
