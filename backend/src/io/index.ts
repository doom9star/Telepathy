import socketIO from "socket.io";
import { sMGR } from "../ts/constants";
import { IOSessionRequest } from "../ts/types";
import conversationHlrs from "./conversationHlrs";
import messageHlrs from "./messageHlrs";
import userHlrs from "./userHlrs";

const IORouter = (IO: socketIO.Server): void => {
  IO.on("connection", async (s: IOSessionRequest) => {
    const uid = s.request.session!.uid!;
    sMGR.add(uid, s);

    userHlrs(s);
    conversationHlrs(s);
    messageHlrs(s);

    s.on("disconnect", async () => {
      sMGR.remove(uid);
    });
  });
};

export default IORouter;
