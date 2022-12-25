import Conversation from "../entity/Conversation";
import { sMGR } from "../ts/constants";
import { IOSessionRequest } from "../ts/types";

export default (s: IOSessionRequest) => {
  s.on("user:active", (cid: string, uid: string) => {
    s.emit("user:active:recieve", cid, !!sMGR.get(uid));
  });

  s.on(
    "user:admin",
    async (type: "promote" | "demote", cid: string, uid: string) => {
      const conversation = await Conversation.findOne({ where: { id: cid } });
      if (conversation) {
        if (type === "promote") conversation.admins.push(uid);
        else if (type === "demote")
          conversation.admins = conversation.admins.filter(
            (aid) => aid !== uid
          );
        await conversation.save();
        s.emit("user:admin:success", type, cid, uid);
        sMGR.get(uid)?.emit("user:admin:success", type, cid, uid);
      }
    }
  );
};
