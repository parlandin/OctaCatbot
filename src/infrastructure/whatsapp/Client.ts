import { inject, injectable } from "tsyringe";
import makeWASocket, {
  useMultiFileAuthState,
  WASocket,
  WAMessage,
} from "@whiskeysockets/baileys";
import { CommandHandler } from "./handlers/CommandHandler";
import { EventHandler } from "./handlers/EventHandler";
import { Logger } from "../Logger";
import { BaileysStore } from "./BaileysStore";

@injectable()
export class WhatsappClient {
  private socket?: WASocket;

  constructor(
    @inject(CommandHandler) private commandHandler: CommandHandler,
    @inject(EventHandler) private eventHandler: EventHandler,
    @inject(Logger) private logger: Logger,
    @inject(BaileysStore) private baileysStore: BaileysStore,
  ) {}

  public async initialize() {
    try {
      this.logger.info("Iniciando conexão com o WhatsApp...");
      const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

      this.socket = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ["Baileys", "Chrome", "1.0"],
        syncFullHistory: false,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: false,
      });

      this.baileysStore.bind(this.socket.ev);

      this.registerEventListeners();
      this.socket.ev.on("creds.update", saveCreds);
    } catch (error) {
      this.logger.error("Erro ao inicializar o WhatsApp: ", error);
    }
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

  private handleConnectionUpdate(update: {
    connection?: string;
    lastDisconnect?: { error?: Error };
  }) {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const errorMessage =
        lastDisconnect?.error?.message || "Erro desconhecido";
      this.logger.warn(`Conexão perdida: ${errorMessage}`);

      if (!errorMessage.includes("logged out")) {
        this.logger.warn("Tentando reconectar...");
        this.initialize();
      } else {
        this.logger.error("Desconectado permanentemente.");
      }
    } else if (connection === "open") {
      this.logger.success("Conectado ao WhatsApp!");
    }
  }

  private async handleIncomingMessages({
    messages,
  }: {
    messages: WAMessage[];
  }) {
    for (const msg of messages) {
      if (msg.key.fromMe || !msg.message) continue;

      const remoteJid = msg.key.remoteJid as string;
      const messageContent =
        msg.message.conversation || msg.message.extendedTextMessage?.text || "";

      if (messageContent.startsWith("/")) {
        await this.commandHandler.executeCommand(
          messageContent.trim(),
          this.socket!,
          remoteJid,
        );
      } else {
        await this.eventHandler.handleEvent("message", this.socket!, msg);
      }
    }
  }
}
