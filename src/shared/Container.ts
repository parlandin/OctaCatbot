import { container } from "tsyringe";
import { WhatsappClient } from "@infrastructure/whatsapp/Client.js";
import { Logger } from "@infrastructure/Logger.js";
import { CommandHandler } from "@infrastructure/whatsapp/handlers/CommandHandler.js";
import { EventHandler } from "@infrastructure/whatsapp/handlers/EventHandler.js";
import { BASE_PATH } from "@utils/BasePath.js";
import path from "path";
import { BaileysStore } from "@infrastructure/whatsapp/BaileysStore.js";
import { LevelDB } from "@infrastructure/Storage.js";
/* import { MessageProcessor } from "@infrastructure/whatsapp/MessageProcessor.js"; */
import { MessageHandler } from "@infrastructure/whatsapp/handlers/MessageHandler.js";

container.registerSingleton(WhatsappClient, WhatsappClient);
container.registerSingleton(LevelDB, LevelDB);
container.registerSingleton(Logger, Logger);
container.registerSingleton(BaileysStore, BaileysStore);
/* container.registerSingleton(MessageProcessor, MessageProcessor); */
container.register(MessageHandler, MessageHandler);
container.register(CommandHandler, CommandHandler);
container.register(EventHandler, EventHandler);

container.register("dbPath", {
  useValue: path.resolve(BASE_PATH, ".local"),
});
