import TelegramBot from "node-telegram-bot-api";

export class MessageUtils {
  private bot: TelegramBot;
  private message: TelegramBot.Message | TelegramBot.CallbackQuery;

  constructor(
    bot: TelegramBot,
    message: TelegramBot.Message | TelegramBot.CallbackQuery,
  ) {
    this.bot = bot;
    this.message = message;
  }

  private getChatId(): number {
    if (this.isMessage(this.message)) {
      return this.message.chat.id;
    }
    return this.message.message?.chat.id as number;
  }

  private getMessageId(): number {
    if (this.isMessage(this.message)) {
      return this.message.message_id;
    }
    return this.message.message?.message_id as number;
  }

  private isMessage(
    msg: TelegramBot.Message | TelegramBot.CallbackQuery,
  ): msg is TelegramBot.Message {
    return "message_id" in msg;
  }

  async sendReaction(emoji: string): Promise<void> {
    const chatId = this.getChatId();
    const messageId = this.getMessageId();

    if (!chatId || !messageId) {
      throw new Error("Unable to get chat_id or message_id");
    }

    const reaction = [{ type: "emoji", emoji }];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    await this.bot.setMessageReaction(chatId, messageId, {
      reaction: JSON.stringify(reaction),
    });
  }

  async sendReply(text: string): Promise<void> {
    const chatId = this.getChatId();
    const messageId = this.getMessageId();

    if (!chatId || !messageId) {
      throw new Error("Unable to get chat_id or message_id");
    }

    await this.bot.sendMessage(chatId, text, {
      reply_to_message_id: messageId,
    });
  }

  async sendText(text: string): Promise<void> {
    const chatId = this.getChatId();

    if (!chatId) {
      throw new Error("Unable to get chat_id");
    }

    await this.bot.sendMessage(chatId, text);
  }

  async sendMarkdown(text: string): Promise<void> {
    const chatId = this.getChatId();

    if (!chatId) {
      throw new Error("Unable to get chat_id");
    }

    await this.bot.sendMessage(chatId, text, {
      parse_mode: "Markdown",
    });
  }

  async sendPhoto(
    photo: Buffer,
    caption?: string,
    filename?: string,
  ): Promise<void> {
    const chatId = this.getChatId();

    if (!chatId) {
      throw new Error("Unable to get chat_id");
    }

    await this.bot.sendPhoto(
      chatId,
      photo,
      {
        caption,
      },
      {
        contentType: "image/png",
        filename,
      },
    );
  }

  async sendDocument(
    document: Buffer,
    caption?: string,
    options?: TelegramBot.SendDocumentOptions,
    fileOptions?: TelegramBot.FileOptions,
  ): Promise<void> {
    const chatId = this.getChatId();

    if (!chatId) {
      throw new Error("Unable to get chat_id");
    }

    await this.bot.sendDocument(
      chatId,
      document,
      {
        caption,
        ...options,
      },
      fileOptions,
    );
  }
}
