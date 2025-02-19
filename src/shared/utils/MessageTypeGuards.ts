import TelegramBot from "node-telegram-bot-api";

export function isMessage(
  msg: TelegramBot.Message | TelegramBot.CallbackQuery,
): msg is TelegramBot.Message {
  return "message_id" in msg;
}

export function isCallbackQuery(
  msg: TelegramBot.Message | TelegramBot.CallbackQuery,
): msg is TelegramBot.CallbackQuery {
  return "data" in msg;
}
