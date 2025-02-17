import { WASocket, WAMessage } from "@whiskeysockets/baileys";

export interface MessageContext {
  socket: WASocket;
  message: WAMessage;
  remoteJid: string;
  messageContent: string;
}
