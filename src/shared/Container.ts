import { container } from "tsyringe";
import { Client } from "@framework/Client.js";
import { Logger } from "@infrastructure/Logger.js";
import { CommandLoader } from "@framework/loaders/CommandsLoader.js";
import { EventLoader } from "@framework/loaders/EventsLoader.js";
import { BASE_PATH } from "@utils/BasePath.js";
import path from "path";
import { LevelDB } from "@infrastructure/Storage.js";
import { MessageHandler } from "@framework/handlers/MessageHandler.js";
import { BotMessageHandler } from "@framework/handlers/BotMessageHandler";
import { CommandMessageHandler } from "@framework/handlers/CommandMessageHandler";
import { OCRImageHandler } from "@framework/handlers/OCRImageHandler";
import { DocumentPDFHandler } from "@framework/handlers/DocumentPDFHandler";

//framework
container.registerSingleton(Client, Client);
container.registerSingleton(LevelDB, LevelDB);
container.registerSingleton(Logger, Logger);

//loaders
container.registerSingleton(CommandLoader, CommandLoader);
container.registerSingleton(EventLoader, EventLoader);

//handlers
container.register(MessageHandler, MessageHandler);
container.register(DocumentPDFHandler, DocumentPDFHandler);
container.register(BotMessageHandler, BotMessageHandler);
container.register(CommandMessageHandler, CommandMessageHandler);
container.register(OCRImageHandler, OCRImageHandler);

//constants
container.register("dbPath", {
  useValue: path.resolve(BASE_PATH, ".local"),
});
