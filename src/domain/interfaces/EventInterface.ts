import TelegramBot from "node-telegram-bot-api";

export abstract class BaseEvent {
  constructor(public readonly name: string) {}

  abstract execute(
    socket: TelegramBot,
    message: TelegramBot.Message | TelegramBot.CallbackQuery,
    extraData?: string,
  ): Promise<void>;
}
