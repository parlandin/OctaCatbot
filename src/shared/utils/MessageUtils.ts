/* eslint-disable @typescript-eslint/ban-ts-comment */
import TelegramBot from "node-telegram-bot-api";

export class MessageUtils {
  private bot: TelegramBot;
  private message: TelegramBot.Message;

  constructor(bot: TelegramBot, message: TelegramBot.Message) {
    this.bot = bot;
    this.message = message;
  }

  async sendReaction(emoji: string): Promise<void> {
    const reaction = [{ type: "emoji", emoji }];
    //@ts-ignore
    await this.bot.setMessageReaction(
      this.message.chat.id,
      this.message.message_id,
      {
        reaction: JSON.stringify(reaction),
      },
    );
  }

  async sendReply(text: string): Promise<void> {
    await this.bot.sendMessage(this.message.chat.id, text, {
      reply_to_message_id: this.message.message_id,
    });
  }

  async sendText(text: string): Promise<void> {
    await this.bot.sendMessage(this.message.chat.id, text);
  }

  async sendMarkdown(text: string): Promise<void> {
    await this.bot.sendMessage(this.message.chat.id, text, {
      parse_mode: "Markdown",
    });
  }

  async sendPhoto(
    photo: Buffer,
    caption?: string,
    filename?: string,
  ): Promise<void> {
    await this.bot.sendPhoto(
      this.message.chat.id,
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
    await this.bot.sendDocument(
      this.message.chat.id,
      document,
      {
        caption,
        ...options,
      },
      fileOptions,
    );
  }
}
