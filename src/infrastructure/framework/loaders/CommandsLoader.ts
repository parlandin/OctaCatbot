import { inject, injectable } from "tsyringe";
import * as fs from "fs";
import * as path from "path";
import { Logger } from "@infrastructure/Logger.js";
import TelegramBot from "node-telegram-bot-api";
import EventEmitter from "events";
import { Command, ICommand } from "@interfaces/CommandInterface";

@injectable()
export class CommandLoader {
  private commands: Map<string, ICommand> = new Map();
  events: EventEmitter<[never]>;
  private commandsPath: string = "../../../application/commands";

  constructor(@inject(Logger) private logger: Logger) {
    this.events = new EventEmitter();
    this.loadCommands();
  }

  private async loadCommands() {
    const commandsDir = path.join(__dirname, this.commandsPath);
    const commandFiles = fs
      .readdirSync(commandsDir)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of commandFiles) {
      const commandPath = path.join(commandsDir, file);
      const commandModule = await import(commandPath);

      if (commandModule?.CommandInstance?.prototype instanceof Command) {
        const CommandClass = commandModule.CommandInstance;
        const commandInstance = new CommandClass();
        this.commands.set(commandInstance.trigger, commandInstance);
        this.logger.info(`Comando carregado: ${commandInstance.trigger}`);
      }
    }

    this.events.emit("commandsLoaded");
  }

  public async executeCommand(
    trigger: string,
    socket: TelegramBot,
    message: TelegramBot.Message,
  ) {
    const commandInstance = this.commands.get(trigger);
    if (commandInstance) {
      this.logger.info(`Executando comando: ${trigger}`);
      await commandInstance.execute(socket, message);
    }
  }

  public async getCommands(): Promise<ICommand[]> {
    return new Promise((resolve) => {
      this.events.on("commandsLoaded", () => {
        resolve(Array.from(this.commands.values()));
      });
    });
  }
}
