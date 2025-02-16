import { inject, injectable } from "tsyringe";
import * as fs from "fs";
import * as path from "path";
import { WASocket } from "@whiskeysockets/baileys";
import { Logger } from "../../Logger";

interface Command {
  command: string;
  execute: (socket: WASocket, remoteJid: string) => Promise<void>;
}

@injectable()
export class CommandHandler {
  private commands: Map<string, Command> = new Map();

  constructor(@inject(Logger) private logger: Logger) {
    this.loadCommands();
  }

  private loadCommands() {
    const commandsDir = path.join(__dirname, "../../application/commands");
    const commandFiles = fs
      .readdirSync(commandsDir)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of commandFiles) {
      const commandPath = path.join(commandsDir, file);
      import(commandPath).then((commandModule) => {
        if (commandModule.command && commandModule.execute) {
          this.commands.set(commandModule.command, commandModule);
          this.logger.info(`Comando carregado: ${commandModule.command}`);
        }
      });
    }
  }

  public async executeCommand(
    command: string,
    socket: WASocket,
    remoteJid: string,
  ) {
    if (this.commands.has(command)) {
      this.logger.info(`Executando comando: ${command}`);

      const commandExecution = this.commands
        .get(command)
        ?.execute(socket, remoteJid);
      await (commandExecution ?? Promise.resolve());
    }
  }
}
