import { NextFunction, Response } from "express";
import { IOSessionRequest, RestSessionRequest } from "./types";
import { Utils } from "./utils";
import { ExtendedError } from "socket.io/dist/namespace";

export const RestAuthenticate = (
  req: RestSessionRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  if (!req.session || !req.session.uid) return res.json(Utils.getResponse(401));
  next();
};

export const IOAuthenticate = (
  socket: IOSessionRequest,
  next: (err?: ExtendedError | undefined) => void
): IOSessionRequest | void => {
  if (!socket.handshake.session || !socket.handshake.session.uid)
    return socket.disconnect(true);
  else next();
};
