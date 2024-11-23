import { NextFunction, Response } from "express";
import { ExtendedError } from "socket.io/dist/namespace";
import { IOSessionRequest, RestSessionRequest } from "./types";
import { Utils } from "./utils";

export const RestAuthenticate = (
  req: RestSessionRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  if (!req.session || !req.session.uid) {
    res.json(Utils.getResponse(401));
  } else {
    next();
  }
};

export const IOAuthenticate = (
  socket: IOSessionRequest,
  next: (err?: ExtendedError | undefined) => void
): IOSessionRequest | void => {
  if (!socket.request.session || !socket.request.session.uid)
    return socket.disconnect(true);
  else next();
};
