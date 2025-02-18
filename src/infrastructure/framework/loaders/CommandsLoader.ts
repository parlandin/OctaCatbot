import { inject, injectable } from "tsyringe";
import * as fs from "fs";
import * as path from "path";
import { Logger } from "@infrastructure/Logger.js";
import TelegramBot from "node-telegram-bot-api";
import EventEmitter from "events";

interface Command {
  command: string;
  description: string;
  execute: (socket: TelegramBot, message: TelegramBot.Message) => Promise<void>;
}

@injectable()
export class CommandLoader {
  private commands: Map<string, Command> = new Map();
  events: EventEmitter<[never]>;

  constructor(@inject(Logger) private logger: Logger) {
    this.events = new EventEmitter();
    this.loadCommands();
  }

  private async loadCommands() {
    const commandsDir = path.join(__dirname, "../../../application/commands");
    const commandFiles = fs
      .readdirSync(commandsDir)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of commandFiles) {
      const commandPath = path.join(commandsDir, file);
      const commandModule = await import(commandPath);

      if (commandModule.command && commandModule.execute) {
        this.commands.set(commandModule.command, commandModule);
        this.logger.info(`Comando carregado: ${commandModule.command}`);
      }
    }

    this.events.emit("commandsLoaded");
  }

  public async executeCommand(
    command: string,
    socket: TelegramBot,
    message: TelegramBot.Message,
  ) {
    if (this.commands.has(command)) {
      this.logger.info(`Executando comando: ${command}`);

      const commandExecution = this.commands
        .get(command)
        ?.execute(socket, message);
      await (commandExecution ?? Promise.resolve());
    }
  }

  public async getCommands() {
    return new Promise<Command[]>((resolve) => {
      this.events.on("commandsLoaded", () => {
        resolve(
          Array.from(this.commands.entries()).map(([, command]) => command),
        );
      });
    });
  }
}
