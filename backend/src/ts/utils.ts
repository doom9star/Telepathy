import { EmailOptions, JsonResponse } from "./types";
import nodeMailer from "nodemailer";
import URIParser from "datauri/parser";
import path from "path";
import socketIO from "socket.io";
import { v2 } from "cloudinary";
import { Message } from "../entity/Message";
import User from "../entity/User";
import Conversation, { ConversationType } from "../entity/Conversation";
import Image from "../entity/Image";

export namespace Utils {
  type TFormat = "INFO" | "ERROR" | "WARNING";
  export function log(message: string, type: TFormat): void {
    if (type === "ERROR") console.log("[ERR] \x1b[31m%s\x1b[0m", message);
    else if (type === "WARNING")
      console.log("[WARN] \x1b[33m%s\x1b[0m", message);
    else console.log("[INFO] \x1b[36m%s\x1b[0m", message);
  }

  const Responses: Record<number, string> = {
    200: "Request Successfull!",
    201: "Resource Created!",
    401: "Request Unauthorized!",
    404: "Resource Not Found!",
    500: "Internal Server Error!",
    400: "Request Refused!",
  };
  export function getResponse(status: number, data?: any): JsonResponse {
    return {
      status: status,
      message: Responses[status],
      body: data,
    };
  }

  export function sendEmail(options: EmailOptions): void {
    const transporter = nodeMailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    transporter.sendMail(options, (error) => {
      if (error) log(error.message, "ERROR");
      else log(`Email sent to ${options.to}`, "INFO");
    });
  }
  const parser = new URIParser();
  export function toDataURI(
    fileName: string,
    buffer: Buffer
  ): string | undefined {
    return parser.format(path.extname(fileName), buffer).content;
  }

  export class SocketMgr<T> {
    private sockets: Map<T, socketIO.Socket> = new Map<T, socketIO.Socket>();
    public add(id: T, socket: socketIO.Socket): void {
      this.sockets.set(id, socket);
    }
    public get(id: T): socketIO.Socket | null | undefined {
      return this.has(id) ? this.sockets.get(id) : null;
    }
    public has(id: T): boolean {
      return this.sockets.has(id);
    }
    public remove(id: T): void {
      this.has(id) && this.sockets.delete(id);
    }
    public broadcast(event: string, message: string, ids: string[]): void {
      ids.forEach((id) => this.get(id as any)?.emit(event, message));
    }
  }

  export function connectCloudinary() {
    v2.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

export namespace DB {
  export function createMessage(
    body: string,
    sender: User | string,
    recieversID: string[],
    isForwarded: boolean = false
  ): Promise<Message> {
    return new Promise<Message>(async (res) => {
      let newMessage = new Message();
      newMessage.body = body;
      newMessage.sender = typeof sender === "string" ? <User>await User.findOne(
              {
                where: { id: sender },
                relations: ["avatar"],
              }
            ) : sender;
      newMessage.recievers = [
        { id: typeof sender === "string" ? sender : sender.id, read: true },
      ].concat(recieversID.map((rid) => ({ id: rid, read: false })));
      newMessage.starrers = [];
      newMessage.forwarded = isForwarded;
      newMessage = await newMessage.save();
      res(newMessage);
    });
  }

  export function createConversation(
    type: ConversationType,
    creatorID: string,
    participantIDS: string[],
    isLegit?: boolean,
    messages?: Message[],
    name?: string,
    description?: string,
    thumbnail?: string
  ): Promise<Conversation> {
    return new Promise<Conversation>(async (res) => {
      let conversation = new Conversation();
      conversation.type = type;
      conversation.creator = <User>await User.findOne({
        where: { id: creatorID },
        relations: ["avatar"],
      });
      conversation.participants = (
        await User.findByIds(participantIDS, { relations: ["avatar"] })
      ).concat(conversation.creator);
      conversation.messages = messages ? messages : [];
      conversation.legit = !!isLegit;
      conversation.unread = conversation.messages.length;
      if (type === ConversationType.GROUP) {
        conversation.name = name;
        if (description) conversation.description = description;
        if (thumbnail) {
          Utils.connectCloudinary();
          const { secure_url, public_id } = await v2.uploader.upload(thumbnail);
          conversation.thumbnail = new Image();
          conversation.thumbnail.url = secure_url;
          conversation.thumbnail.cid = public_id;
        }
        conversation.admins = [creatorID];
      }
      conversation = await conversation.save();
      res(conversation);
    });
  }
}
