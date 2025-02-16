import { inject, injectable } from "tsyringe";
import makeWASocket, {
  useMultiFileAuthState,
  WASocket,
  WAMessage,
  proto,
} from "@whiskeysockets/baileys";
import { CommandHandler } from "./handlers/CommandHandler";
import { EventHandler } from "./handlers/EventHandler";
import { Logger } from "../Logger";
import { BaileysStore } from "./BaileysStore";
import { pinoLogger } from "../../shared/utils/BaileysLogger";
import { LevelDB } from "../Storage";
import { isDev } from "../../shared/utils/isDev";
import { MessageProcessor } from "./MessageProcessor";

@injectable()
export class WhatsappClient {
  private socket?: WASocket;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(
    @inject(CommandHandler) private commandHandler: CommandHandler,
    @inject(EventHandler) private eventHandler: EventHandler,
    @inject(Logger) private logger: Logger,
    @inject(BaileysStore) private baileysStore: BaileysStore,
    @inject(LevelDB) private db: LevelDB,
    @inject(MessageProcessor) private messageProcessor: MessageProcessor,
  ) {}

  public async initialize() {
    try {
      this.logger.info("Iniciando conexão com o WhatsApp...");
      const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

      this.socket = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: [`${isDev ? "Pop-os" : "discloud"}`, "Chrome", "1.0"],

        syncFullHistory: false,
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: false,
        logger: pinoLogger,
        getMessage: async (key): Promise<proto.IMessage | undefined> => {
          try {
            const message = await this.db.getData<proto.IMessage>(
              "messages",
              `${key.remoteJid}:${key.id}`,
            );

            console.log("getMessage", message);
            return message ?? undefined;
          } catch {
            return undefined;
          }
        },
      });

      this.messageProcessor.initializeQueue(this.socket);

      this.baileysStore.bind(this.socket.ev);

      this.registerEventListeners();

      this.socket.ev.on("creds.update", saveCreds);

      this.startPeriodicCleanup();

      this.reconnectAttempts = 0;
    } catch (error) {
      this.logger.error("Erro ao inicializar o WhatsApp: ", error);
      throw error;
    }
  }

  private startPeriodicCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(
      async () => {
        try {
          const cutoffDate = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 dias
          const keys = await this.db.listKeys("messages");

          for (const key of keys) {
            const msg = await this.db.getData<proto.IWebMessageInfo>(
              "messages",
              key,
            );
            if (
              msg?.messageTimestamp &&
              Number(msg.messageTimestamp) < cutoffDate
            ) {
              await this.db.delete("messages", key);
            }
          }

          this.logger.info("Limpeza periódica concluída");
        } catch (error) {
          this.logger.error("Erro na limpeza periódica: ", error);
        }
      },
      24 * 60 * 60 * 1000,
    );
  }

  private registerEventListeners() {
    if (!this.socket) return;

    this.socket.ev.on(
      "connection.update",
      this.handleConnectionUpdate.bind(this),
    );

    this.socket.ev.on(
      "messages.upsert",
      this.handleIncomingMessages.bind(this),
    );
  }

  private async handleConnectionUpdate(update: {
    connection?: string;
    lastDisconnect?: { error?: Error };
  }) {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const errorMessage =
        lastDisconnect?.error?.message || "Erro desconhecido";
      this.logger.warn(`Conexão perdida: ${errorMessage}`);

      if (
        !errorMessage.includes("logged out") &&
        this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS
      ) {
        this.reconnectAttempts++;
        this.logger.warn(
          `Tentando reconectar (tentativa ${this.reconnectAttempts})...`,
        );
        await this.initialize();
      } else {
        this.logger.error("Desconectado permanentemente.");

        if (this.cleanupInterval) {
          clearInterval(this.cleanupInterval);
        }
      }
    } else if (connection === "open") {
      this.logger.success("Conectado ao WhatsApp!");
      this.reconnectAttempts = 0;
    }
  }

  private async handleIncomingMessages({
    messages,
  }: {
    messages: WAMessage[];
  }) {
    if (this.socket) {
      await this.messageProcessor.processMessages(this.socket, messages);
    }
  }
}
