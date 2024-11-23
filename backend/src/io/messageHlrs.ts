import { Like } from "typeorm";
import Conversation, { ConversationType } from "../entity/Conversation";
import { Message } from "../entity/Message";
import { sMGR } from "../ts/constants";
import { IOSessionRequest } from "../ts/types";
import { DB } from "../ts/utils";

export default (s: IOSessionRequest) => {
  const uid = s.request.session!.uid!;

  s.on("message:create", async (cid: string, body: string) => {
    const conversation = await Conversation.findOne({
      where: { id: cid },
      join: {
        alias: "c",
        leftJoinAndSelect: {
          participants: "c.participants",
          avatar: "participants.avatar",
        },
      },
    });
    if (conversation) {
      const otherIDS = conversation.participants
        .filter((p) => p.id !== uid)
        .map((p) => p.id);
      const newMessage = await DB.createMessage(body, uid, otherIDS);
      await Conversation.createQueryBuilder("c")
        .relation("messages")
        .of(conversation)
        .add(newMessage);
      sMGR.get(uid)?.emit("message:create:success", newMessage);

      if (conversation.legit)
        otherIDS.forEach((oid) => {
          sMGR.get(oid)?.emit("message:recieve", cid, newMessage);
        });
      else {
        conversation.legit = true;
        await conversation.save();
        conversation.unread = 1;
        conversation.messages = [newMessage];
        otherIDS.forEach((oid) =>
          sMGR.get(oid)?.emit("conversation:recieve", conversation)
        );
      }
    }
  });

  s.on("message:read", async (cid: string) => {
    const messages = await Message.find({
      where: {
        recievers: Like(`%{"id":"${uid}","read":false}%`),
        conversation: { id: cid },
      },
    });
    for (const message of messages) {
      message.recievers[message.recievers.findIndex((r) => r.id === uid)] = {
        id: uid,
        read: true,
      };
      await message.save();
    }
    s.emit("message:read:success", cid);
    if (messages[0]?.recievers.length === 2) {
      const readReciever = messages[0].recievers.find((r) => r.id !== uid)!;
      sMGR.get(readReciever.id)?.emit("message:read:recieve", cid, uid);
    }
  });

  s.on(
    "message:forward",
    async (mid: string, ids: { uid?: string; cid?: string }[]) => {
      const message = await Message.findOne({
        where: { id: mid },
        relations: ["sender", "sender.avatar"],
      });
      if (message) {
        const newConvos: Conversation[] = [];
        const existingConvos: { [cid: string]: Message } = {};

        for (const id of ids) {
          if (id.cid) {
            const conversation = <Conversation>await Conversation.findOne({
              where: { id: id.cid },
              relations: ["participants"],
            });
            const otherIDS = conversation.participants
              .filter((p) => p.id !== uid)
              .map((p) => p.id);
            const clonedMessage = await DB.createMessage(
              message.body,
              uid,
              otherIDS,
              true
            );
            await Conversation.createQueryBuilder("c")
              .relation("messages")
              .of(conversation)
              .add(clonedMessage);
            otherIDS.forEach((oid) =>
              sMGR
                .get(oid)
                ?.emit("message:recieve", conversation.id, clonedMessage)
            );
            existingConvos[conversation.id] = clonedMessage;
          } else {
            const clonedMessage = await DB.createMessage(
              message.body,
              uid,
              [id.uid!],
              true
            );
            const conversation = await DB.createConversation(
              ConversationType.SOLO,
              uid,
              [id.uid!],
              true,
              [clonedMessage]
            );
            newConvos.push(conversation);
            conversation.unread = 1;
            sMGR.get(id.uid!)?.emit("conversation:recieve", conversation);
          }
        }
        s.emit("message:forward:success", newConvos, existingConvos);
      }
    }
  );
};
