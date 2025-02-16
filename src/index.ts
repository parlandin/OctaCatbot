import "reflect-metadata";
import "./shared/Container";
import { container } from "tsyringe";
import { WhatsappClient } from "./infrastructure/whatsapp/Client";
import { Logger } from "./infrastructure/Logger";

const bootstrap = async () => {
  const logger = container.resolve(Logger);
  const app = container.resolve(WhatsappClient);
  await app.initialize();

  logger.info("Bot inicializado com sucesso!");
};

bootstrap().catch((error) => {
  console.error("Erro ao inicializar o bot: ", error);
});
