import TelegramBot from "node-telegram-bot-api";

export interface ICommand {
  trigger: string;
  description: string;
  execute(socket: TelegramBot, message: TelegramBot.Message): Promise<void>;
}

export abstract class Command implements ICommand {
  abstract trigger: string;
  abstract description: string;
  abstract execute(
    socket: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void>;
}
