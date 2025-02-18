import { inject, injectable } from "tsyringe";
import * as fs from "fs";
import * as path from "path";
import { Logger } from "@infrastructure/Logger.js";
import TelegramBot from "node-telegram-bot-api";
import { BaseEvent } from "@interfaces/EventInterface";

@injectable()
export class EventLoader {
  private events: Map<string, BaseEvent> = new Map();
  private eventsPath: string = "../../../application/events";

  constructor(@inject(Logger) private logger: Logger) {
    this.loadEvents();
  }

  private async loadEvents() {
    const eventsDir = path.join(__dirname, this.eventsPath);
    const eventFiles = fs
      .readdirSync(eventsDir)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of eventFiles) {
      const eventPath = path.join(eventsDir, file);
      const eventModule = await import(eventPath);

      if (eventModule?.EventInstance?.prototype instanceof BaseEvent) {
        const EventClass = eventModule.EventInstance;
        const eventInstance = new EventClass();
        this.events.set(eventInstance.name, eventInstance);
        this.logger.info(`Evento carregado: ${eventInstance.name}`);
      }
    }
  }

  public async handleEvent(
    eventName: string,
    socket: TelegramBot,
    message: TelegramBot.Message,
  ) {
    const eventInstance = this.events.get(eventName);
    if (eventInstance) {
      this.logger.info(`Executando evento: ${eventName}`);
      await eventInstance.execute(socket, message);
    }
  }
}
