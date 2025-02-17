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
import { SelfMessageHandler } from "@whatsapp/handlers/SelfMessageHandler";
import { CommandMessageHandler } from "@whatsapp/handlers/CommandMessageHandler";
import { OCRImageHandler } from "@whatsapp/handlers/OCRImageHandler";
import { StickerHandler } from "@whatsapp/handlers/StickerHandler";

container.registerSingleton(WhatsappClient, WhatsappClient);
container.registerSingleton(LevelDB, LevelDB);
container.registerSingleton(Logger, Logger);
container.registerSingleton(BaileysStore, BaileysStore);
/* container.registerSingleton(MessageProcessor, MessageProcessor); */

//handlers
container.register(MessageHandler, MessageHandler);
container.registerSingleton(CommandHandler, CommandHandler);
container.registerSingleton(EventHandler, EventHandler);
container.register(SelfMessageHandler, SelfMessageHandler);
container.register(CommandMessageHandler, CommandMessageHandler);
container.register(OCRImageHandler, OCRImageHandler);
container.register(StickerHandler, StickerHandler);

container.register("dbPath", {
  useValue: path.resolve(BASE_PATH, ".local"),
});
