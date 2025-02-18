import { inject, injectable } from "tsyringe";
import * as fs from "fs";
import * as path from "path";
import { Logger } from "@infrastructure/Logger.js";
import TelegramBot from "node-telegram-bot-api";

interface Event {
  event: string;
  execute: (socket: TelegramBot, message: TelegramBot.Message) => Promise<void>;
}

@injectable()
export class EventLoader {
  private events: Map<string, Event> = new Map();

  constructor(@inject(Logger) private logger: Logger) {
    this.loadEvents();
  }

  private loadEvents() {
    const eventsDir = path.join(__dirname, "../../../application/events");
    const eventFiles = fs
      .readdirSync(eventsDir)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of eventFiles) {
      const eventPath = path.join(eventsDir, file);
      import(eventPath).then((eventModule) => {
        if (eventModule.event && eventModule.execute) {
          this.events.set(eventModule.event, eventModule);
          this.logger.info(`Evento carregado: ${eventModule.event}`);
        }
      });
    }
  }

  public async handleEvent(
    eventName: string,
    socket: TelegramBot,
    message: TelegramBot.Message,
  ) {
    if (this.events.has(eventName)) {
      await this.events.get(eventName)?.execute(socket, message);
    }
  }
}
