import { WASocket, WAMessage } from "@whiskeysockets/baileys";

export interface MessageContext {
  socket: WASocket;
  data: WAMessage;
  remoteJid: string;
  messageContent: string;
}
