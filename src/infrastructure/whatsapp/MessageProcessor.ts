/* import { inject, injectable } from "tsyringe";
import PQueue from "p-queue";
import { WASocket, WAMessage } from "@whiskeysockets/baileys";
import { Logger } from "@infrastructure/Logger.js";
import { LevelDB } from "@infrastructure/Storage.js";
import { MessageHandler } from "@infrastructure/whatsapp/handlers/MessageHandler.js";

interface QueuedMessage {
  id: string;
  timestamp: number;
  message: WAMessage;
  processed: boolean;
}

interface ProcessingContext {
  socket: WASocket;
  message: QueuedMessage;
}

@injectable()
export class MessageProcessor {
  private messageQueue: PQueue;
  private readonly QUEUE_KEY = "message_queue";
  private isRestoring = false;

  constructor(
    @inject(Logger) private logger: Logger,
    @inject(LevelDB) private db: LevelDB,
    @inject(MessageHandler) private messageHandler: MessageHandler,
  ) {
    this.messageQueue = new PQueue({ concurrency: 5 });

    this.messageQueue.on("active", () => {
      this.logger.info(
        `Tamanho da fila: ${this.messageQueue.size} Pendentes: ${this.messageQueue.pending}`,
      );
    });

    this.messageQueue.on("idle", async () => {
      if (!this.isRestoring) {
        await this.cleanProcessedMessages();
      }
      this.logger.info("Todas as mensagens foram processadas");
    });
  }

  public async initializeQueue(socket: WASocket) {
    try {
      this.isRestoring = true;
      const savedMessages =
        (await this.db.getData<QueuedMessage[]>(this.QUEUE_KEY, "pending")) ||
        [];

      if (savedMessages.length > 0) {
        this.logger.info(
          `Restaurando ${savedMessages.length} mensagens da fila...`,
        );

        savedMessages.sort((a, b) => a.timestamp - b.timestamp);

        for (const message of savedMessages) {
          if (!message.processed) {
            const context: ProcessingContext = { socket, message };
            this.messageQueue.add(() =>
              this.processMessageWithPersistence(context),
            );
          }
        }
      }
    } catch (error) {
      this.logger.error("Erro ao restaurar a fila:", error);
    } finally {
      this.isRestoring = false;
    }
  }

  public async processMessages(socket: WASocket, messages: WAMessage[]) {
    for (const msg of messages) {
      if (msg.key.fromMe || !msg.message) continue;

      const queuedMessage: QueuedMessage = {
        id: `${msg.key.remoteJid}:${msg.key.id}`,
        timestamp: Date.now(),
        message: msg,
        processed: false,
      };

      await this.saveMessageToQueue(queuedMessage);

      const context: ProcessingContext = { socket, message: queuedMessage };
      this.messageQueue.add(() => this.processMessageWithPersistence(context));
    }
  }

  private async processMessageWithPersistence({
    socket,
    message: queuedMessage,
  }: ProcessingContext) {
    try {
      await this.messageHandler.handleMessage(socket, queuedMessage.message);

      queuedMessage.processed = true;
      await this.updateMessageInQueue(queuedMessage);
    } catch (error) {
      this.logger.error(
        `Erro ao processar mensagem ${queuedMessage.id}:`,
        error,
      );
    }
  }

  private async saveMessageToQueue(message: QueuedMessage) {
    try {
      const currentQueue =
        (await this.db.getData<QueuedMessage[]>(this.QUEUE_KEY, "pending")) ||
        [];
      currentQueue.push(message);
      await this.db.setData(this.QUEUE_KEY, "pending", currentQueue);
    } catch (error) {
      this.logger.error("Erro ao salvar mensagem na fila:", error);
    }
  }

  private async updateMessageInQueue(message: QueuedMessage) {
    try {
      const currentQueue =
        (await this.db.getData<QueuedMessage[]>(this.QUEUE_KEY, "pending")) ||
        [];
      const updatedQueue = currentQueue.map((m) =>
        m.id === message.id ? message : m,
      );
      await this.db.setData(this.QUEUE_KEY, "pending", updatedQueue);
    } catch (error) {
      this.logger.error("Erro ao atualizar mensagem na fila:", error);
    }
  }

  private async cleanProcessedMessages() {
    try {
      const currentQueue =
        (await this.db.getData<QueuedMessage[]>(this.QUEUE_KEY, "pending")) ||
        [];
      const pendingMessages = currentQueue.filter((m) => !m.processed);

      if (pendingMessages.length < currentQueue.length) {
        await this.db.setData(this.QUEUE_KEY, "pending", pendingMessages);
        this.logger.info(
          `Removidas ${currentQueue.length - pendingMessages.length} mensagens processadas da fila`,
        );
      }
    } catch (error) {
      this.logger.error("Erro ao limpar mensagens processadas:", error);
    }
  }

  public async getQueueStatus() {
    const currentQueue =
      (await this.db.getData<QueuedMessage[]>(this.QUEUE_KEY, "pending")) || [];
    return {
      totalMessages: currentQueue.length,
      pendingMessages: currentQueue.filter((m) => !m.processed).length,
      queueSize: this.messageQueue.size,
      pending: this.messageQueue.pending,
      isPaused: this.messageQueue.isPaused,
    };
  }

  public pauseProcessing() {
    this.messageQueue.pause();
  }

  public resumeProcessing() {
    this.messageQueue.start();
  }

  public async clearQueue() {
    this.messageQueue.clear();
    await this.db.setData(this.QUEUE_KEY, "pending", []);
  }
}
 */
