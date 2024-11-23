import { v2 } from "cloudinary";
import Conversation, { ConversationType } from "../entity/Conversation";
import User from "../entity/User";
import { sMGR } from "../ts/constants";
import { ImageState, IOSessionRequest } from "../ts/types";
import { DB, Utils } from "../ts/utils";

export default (s: IOSessionRequest) => {
  const uid = s.request.session!.uid!;

  s.on(
    "conversation:create",
    async (
      type: ConversationType,
      info: {
        name?: string;
        description?: string;
        thumbnail?: string;
        participants: string[];
      }
    ) => {
      const conversation = await DB.createConversation(
        type,
        uid,
        info.participants,
        type === ConversationType.GROUP,
        [],
        info.name,
        info.description,
        info.thumbnail
      );
      s.emit("conversation:create:success", conversation);
      if (type === ConversationType.GROUP) {
        conversation.unread = 1;
        info.participants.forEach((id) =>
          sMGR.get(id)?.emit("conversation:recieve", conversation)
        );
      }
    }
  );

  s.on(
    "conversation:edit",
    async (
      cid: string,
      info: {
        name: string;
        description: string;
        thumbnail: string | null;
        thumbnailState: ImageState;
        participants: string[];
      }
    ) => {
      let conversation = await Conversation.createQueryBuilder("c")
        .leftJoinAndSelect("c.thumbnail", "ct")
        .leftJoinAndSelect("c.creator", "cc")
        .where("c.id = :cid", { cid })
        .getOne();
      if (conversation) {
        conversation.name = info.name;
        conversation.description = info.description;
        conversation.participants = (
          await User.findByIds(info.participants)
        ).concat(conversation.creator);

        if (
          info.thumbnailState === ImageState.REMOVE ||
          info.thumbnailState === ImageState.UPDATE
        ) {
          Utils.connectCloudinary();
          await v2.uploader.destroy(conversation.thumbnail!.cid);

          if (info.thumbnailState === ImageState.REMOVE)
            await conversation.thumbnail?.remove();
          else {
            const { public_id, secure_url } = await v2.uploader.upload(
              info.thumbnail!
            );
            conversation.thumbnail!.url = secure_url;
            conversation.thumbnail!.cid = public_id;
          }
        }
        conversation = await conversation.save();
        s.emit("conversation:edit:success", conversation);
        info.participants.forEach((id) =>
          sMGR.get(id)?.emit("conversation:recieve", conversation)
        );
      }
    }
  );
};
