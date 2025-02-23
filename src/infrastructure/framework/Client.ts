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
    this.setCommands();
    this.loadingEvents();
  }

  private async loadingEvents() {
    this.socket?.on("message", async (msg) => {
      await this.handleIncomingMessages({ messages: msg });
    });

    this.socket?.on("callback_query", async (msg) => {
      await this.handleIncomingMessages({ messages: msg });
    });
  }

  private async handleIncomingMessages({
    messages,
  }: {
    messages: TelegramBot.Message | TelegramBot.CallbackQuery;
  }) {
    if (this.socket) {
      await this.messageProcessor.handleMessage(this.socket, messages);
    }
  }

  private async setCommands() {
    const commands: TelegramBot.BotCommand[] = [];

    (await this.commandLoader.getCommands()).forEach((command) => {
      commands.push({
        command: command.trigger,
        description: command.description,
      });
    });

    await this.socket?.setMyCommands(commands);
  }
}
