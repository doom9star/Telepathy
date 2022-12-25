interface IBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface IImage extends IBase {
  url: string;
  cid: string;
}

export interface IUser extends IBase {
  email: string;
  username: string;
  avatar?: IImage;
  restricted: boolean;
  bio?: string;
}

export interface IMessage extends IBase {
  sender: IUser;
  recievers: { id: string; read: boolean }[];
  body: string;
  forwarded: boolean;
  starrers: string[];
  conversation?: IConversation;
}

export enum ConversationType {
  SOLO = "SOLO",
  GROUP = "GROUP",
}

export interface IConversation extends IBase {
  name?: string;
  description?: string;
  thumbnail?: IImage;
  type: ConversationType;
  creator: IUser;
  participants: IUser[];
  messages: IMessage[];
  admins?: string[];
  unread?: number;
}

export type IJsonResponse = {
  status: number;
  message: string;
  body?: any;
};

export enum GLTypes {
  MESSAGE_CREATION,
  CONVERSATION_CREATION,
  CONVERSATION_EDIT,
  MESSAGE_FORWARD,
  MESSAGE_READ,
}

export enum ImageState {
  NONE = "NONE",
  REMOVE = "REMOVE",
  UPDATE = "UPDATE",
}

export enum ScreenType {
  INFO,
  SHARE,
  MESSAGE,
  STARRED,
}
