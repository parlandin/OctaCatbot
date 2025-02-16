import { container } from "tsyringe";
import { WhatsappClient } from "../infrastructure/whatsapp/Client";
import { Logger } from "../infrastructure/Logger";
import { CommandHandler } from "../infrastructure/whatsapp/handlers/CommandHandler";
import { EventHandler } from "../infrastructure/whatsapp/handlers/EventHandler";
import { BASE_PATH } from "./utils/BasePath";
import path from "path";
import { BaileysStore } from "../infrastructure/whatsapp/BaileysStore";
import { LevelDB } from "../infrastructure/Storage";
import { MessageProcessor } from "../infrastructure/whatsapp/MessageProcessor";
import { MessageHandler } from "../infrastructure/whatsapp/handlers/MessageHandler";

container.registerSingleton(WhatsappClient, WhatsappClient);
container.registerSingleton(LevelDB, LevelDB);
container.registerSingleton(Logger, Logger);
container.registerSingleton(BaileysStore, BaileysStore);
container.registerSingleton(MessageProcessor, MessageProcessor);
container.register(MessageHandler, MessageHandler);
container.register(CommandHandler, CommandHandler);
container.register(EventHandler, EventHandler);

container.register("dbPath", {
  useValue: path.resolve(BASE_PATH, ".local"),
});
