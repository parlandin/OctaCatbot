import { inject, injectable } from "tsyringe";
import { Logger } from "@infrastructure/Logger.js";
import { MessageHandler } from "./handlers/MessageHandler";
import TelegramBot from "node-telegram-bot-api";
import { CommandLoader } from "./loaders/CommandsLoader";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

@injectable()
export class Client {
  private socket?: TelegramBot;

  constructor(
    @inject(Logger) private logger: Logger,
    @inject(MessageHandler) private messageProcessor: MessageHandler,
    @inject(CommandLoader) private commandLoader: CommandLoader,
  ) {
    this.socket = new TelegramBot(TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
  }

  public async initialize() {
    this.logger.info("Telegram Client initialized");
    this.handlerMessageEvent();
    this.setCommands();
  }

  private async handlerMessageEvent() {
    this.socket?.on("message", async (msg) => {
      await this.handleIncomingMessages({ messages: msg });
    });
  }

  private async handleIncomingMessages({
    messages,
  }: {
    messages: TelegramBot.Message;
  }) {
    if (this.socket) {
      await this.messageProcessor.handleMessage(this.socket, messages);
    }
  }

  private async setCommands() {
    (await this.commandLoader.getCommands()).forEach((data) => {
      this.socket?.setMyCommands([
        {
          command: data.command,
          description: data.description,
        },
      ]);
    });
  }
}
