import { Router, Response } from "express";
import { Like } from "typeorm";
import Conversation from "../entity/Conversation";
import { Message } from "../entity/Message";
import User from "../entity/User";
import { RestAuthenticate } from "../ts/middleware";
import { RestSessionRequest, SearchOptions } from "../ts/types";
import { Utils } from "../ts/utils";
import ImageRouter from "./image";

const router = Router();

router.use("/image", ImageRouter);

router.get(
  "/search/user/:option/:query",
  RestAuthenticate,
  async (req: RestSessionRequest, res: Response): Promise<Response> => {
    const option = req.params.option as any;
    const query = req.params.query;
    let qb = User.createQueryBuilder("u")
      .leftJoinAndSelect("u.avatar", "a")
      .where("u.restricted = 0")
      .andWhere("u.id <> :id", { id: req.session.uid });

    if (option == SearchOptions.ID)
      qb = qb.andWhere("u.id = :query", { query });
    else if (option == SearchOptions.NAME)
      qb = qb.andWhere("u.username LIKE :query", { query: `%${query}%` });

    const users = await qb.getMany();
    return res.json(Utils.getResponse(200, users));
  }
);

router.put(
  "/restrict/:value",
  RestAuthenticate,
  async (req: RestSessionRequest, res: Response) => {
    const value = parseInt(req.params.value);
    await User.update({ id: req.session.uid }, { restricted: !!value });
    return res.json(Utils.getResponse(200));
  }
);

router.get(
  "/conversations",
  RestAuthenticate,
  async (req: RestSessionRequest, res: Response) => {
    const uid = req.session.uid;
    await Conversation.delete({ legit: false });

    let conversations = await Conversation.createQueryBuilder("c")
      .leftJoinAndSelect("c.participants", "ps")
      .leftJoinAndSelect("c.thumbnail", "ct")
      .leftJoinAndSelect("c.creator", "cc")
      .leftJoinAndSelect("c.participants", "aps")
      .leftJoinAndSelect("aps.avatar", "a")
      .where("c.legit = 1 AND ps.id = :id", { id: uid })
      .getMany();

    conversations = await Promise.all(
      conversations.map(async (c) => {
        const unreadMessages = await Message.createQueryBuilder("m")
          .leftJoinAndSelect("m.sender", "ms")
          .leftJoinAndSelect("ms.avatar", "msa")
          .where("m.conversation = :cid", { cid: c.id })
          .andWhere("m.recievers like :exp", {
            exp: `%{"id":"${uid}","read":false}%`,
          })
          .orderBy("m.createdAt", "DESC")
          .getMany();
        c.unread = unreadMessages.length;
        if (c.unread > 0) c.messages = unreadMessages;
        else
          c.messages = await Message.createQueryBuilder("m")
            .leftJoinAndSelect("m.sender", "ms")
            .leftJoinAndSelect("ms.avatar", "msa")
            .where("m.conversation = :cid", { cid: c.id })
            .orderBy("m.createdAt", "DESC")
            .take(1)
            .getMany();
        return c;
      })
    );

    return res.json(Utils.getResponse(200, conversations));
  }
);

router.post(
  "/messages",
  RestAuthenticate,
  async (req: RestSessionRequest, res: Response) => {
    const { cid, offset } = req.body;
    const messages = await Message.createQueryBuilder("m")
      .leftJoinAndSelect("m.sender", "sender")
      .leftJoinAndSelect("sender.avatar", "avatar")
      .where("m.conversation = :cid", { cid })
      .orderBy("m.createdAt", "DESC")
      .skip(offset)
      .take(11)
      .getMany();

    return res.json(
      Utils.getResponse(200, {
        cid,
        messages: messages.slice(0, 10),
        more: messages.length === 11,
      })
    );
  }
);

router
  .route("/message/star")
  .all(RestAuthenticate)
  .get(async (req: RestSessionRequest, res) => {
    const messages = await Message.find({
      where: {
        starrers: Like(`%${req.session.uid}%`),
      },
      relations: ["sender", "sender.avatar", "conversation"],
      order: { createdAt: "DESC" },
    });
    return res.json(Utils.getResponse(200, messages));
  })
  .post(async (req: RestSessionRequest, res) => {
    const { mid, value } = req.body;
    const uid = req.session.uid!;
    const message = await Message.findOne({
      where: { id: mid },
    });
    if (!message) return res.json(Utils.getResponse(404));
    if (value === 1) message.starrers.push(uid);
    else message.starrers = message.starrers.filter((sid) => sid !== uid);
    await message.save();
    return res.json(Utils.getResponse(200));
  });

export default router;
