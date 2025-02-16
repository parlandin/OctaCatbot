import { WASocket } from "@whiskeysockets/baileys";

export const command = "/ping";

export async function execute(socket: WASocket, remoteJid: string) {
  await socket.sendMessage(remoteJid, { text: "Pong! 🏓" });
}
