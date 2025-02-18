import TelegramBot from "node-telegram-bot-api";

export interface MessageContext {
  socket: TelegramBot;
  data: TelegramBot.Message;
}
