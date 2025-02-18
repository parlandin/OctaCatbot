/* import {
  AnyMessageContent,
  MiscMessageGenerationOptions,
  proto,
  WASocket,
} from "@whiskeysockets/baileys";

export const replyMessage = async (
  socket: WASocket,
  message: proto.IWebMessageInfo,
  content: AnyMessageContent,
  opt?: MiscMessageGenerationOptions,
) => {
  const useID = message.key.remoteJid as string;
  await socket.sendMessage(useID, content, {
    quoted: message,
    ...opt,
  });
};

export const reactMessage = async (
  socket: WASocket,
  message: proto.IWebMessageInfo,
  emoji: string,
  opt?: MiscMessageGenerationOptions,
) => {
  await replyMessage(
    socket,
    message,
    {
      react: {
        text: emoji,
        key: message.key,
      },
    },
    {
      quoted: undefined,
      ...opt,
    },
  );
};
 */
