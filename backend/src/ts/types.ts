import { Request } from "express";
import { Session } from "express-session";
import socketIO from "socket.io";

export type RestSessionRequest = Request & {
  session?: Session & { uid?: string };
};

export type IOSessionRequest = socketIO.Socket & {
  handshake: socketIO.Socket["handshake"] & {
    session?: Session & { uid?: string };
  };
};

export type JsonResponse = {
  status: number;
  message: string;
  body?: any;
};

export interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export enum ImageState {
  NONE = "NONE",
  REMOVE = "REMOVE",
  UPDATE = "UPDATE",
}

export enum SearchOptions {
  ID,
  NAME,
}
