import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import socketIOSession from "express-socket.io-session";
import http from "http";
import { join } from "path";
import "reflect-metadata";
import socketIO from "socket.io";
import { createConnection } from "typeorm";
import IORouter from "./io";
import MainRouter from "./routes";
import { IOAuthenticate } from "./ts/middleware";
import { RedisAuthSession } from "./ts/redis";
import { Utils } from "./ts/utils";

dotenv.config({ path: join(__dirname, "../.env") });

const main = async () => {
  await createConnection();

  const app = express();
  const session = await RedisAuthSession.connect();

  app.use(cors({ origin: process.env.FRONTEND, credentials: true }));
  app.use(express.json());
  app.use(session);
  app.use("/", MainRouter);

  const HTTPServer = http.createServer(app);

  const IO = new socketIO.Server(HTTPServer, {
    cors: { credentials: true, origin: process.env.FRONTEND },
  });
  IO.use(socketIOSession(session) as any);
  IO.use(IOAuthenticate);
  IORouter(IO);

  HTTPServer.listen(5000, () => {
    Utils.log("Server running at http://localhost:5000", "INFO");
  });
};

main();
