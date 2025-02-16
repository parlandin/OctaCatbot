import { Logger } from "@infrastructure/Logger.js";
import { LevelDB } from "@infrastructure/Storage.js";
import {
  BaileysEventEmitter,
  Chat,
  Contact,
  WAMessage,
  WAMessageKey,
  WAReadReceiptsValue,
} from "@whiskeysockets/baileys";
import { inject, injectable } from "tsyringe";

@injectable()
export class BaileysStore {
  constructor(
    @inject(LevelDB) private db: LevelDB,
    @inject(Logger) private logger: Logger,
  ) {
    this.logger.info("Inicializando BaileysStore...");
  }

  bind(ev: BaileysEventEmitter) {
    ev.on("chats.upsert", this.handleChatsUpsert.bind(this));
    ev.on("contacts.upsert", this.handleContactsUpsert.bind(this));
    ev.on("messages.upsert", this.handleMessagesUpsert.bind(this));
    ev.on("message-receipt.update", this.handleMessageReceiptUpdate.bind(this));
  }

  private async handleChatsUpsert(chats: Chat[]) {
    for (const chat of chats) {
      await this.db.setData("chats", chat.id, chat);
    }
  }

  private async handleContactsUpsert(contacts: Contact[]) {
    for (const contact of contacts) {
      await this.db.setData("contacts", contact.id, contact);
    }
  }

  private async handleMessagesUpsert({ messages }: { messages: WAMessage[] }) {
    for (const msg of messages) {
      const key = msg.key;

      await this.db.setData("messages", `${key.remoteJid}:${key.id}`, msg);
    }
  }

  private async handleMessageReceiptUpdate(
    receipts: { key: WAMessageKey; receipt: WAReadReceiptsValue }[],
  ) {
    for (const { key, receipt } of receipts) {
      await this.db.setData("receipts", `${key.remoteJid}:${key.id}`, receipt);
    }
  }

  async loadMessages(chatId: string, limit: number = 25): Promise<WAMessage[]> {
    const allMessageKeys = await this.db.listKeys("messages");

    const chatMessagesKeys = allMessageKeys
      .filter((key: string) => key.startsWith(`${chatId}:`))
      .sort((a, b) => a.localeCompare(b));

    const messages: WAMessage[] = [];
    for (const key of chatMessagesKeys.slice(-limit)) {
      const msg = await this.db.getData<WAMessage>("messages", key);
      if (msg) messages.push(msg);
    }

    return messages;
  }
}
