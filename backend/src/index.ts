import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import { join } from "path";
import "reflect-metadata";
import { createConnection } from "typeorm";
import MainRouter from "./routes";
import { RedisAuthSession } from "./ts/redis";
import { Utils } from "./ts/utils";
import http from "http";
import socketIO from "socket.io";
import socketIOSession from "express-socket.io-session";
import IORouter from "./io";
import { IOAuthenticate } from "./ts/middleware";

(async () => {
  dotenv.config({ path: join(__dirname, "../.env") });

  const connection = await createConnection();
  if (connection) await connection.queryResultCache!.clear();

  const app: Application = express();
  const session = await RedisAuthSession.connect();

  app.use(cors({ origin: process.env.FRONTEND, credentials: true }));
  app.use(express.json());
  app.use(session);
  app.use("/", MainRouter);

  const HTTPServer = http.createServer(app);

  const IO = new socketIO.Server(HTTPServer, {
    cors: { credentials: true, origin: process.env.FRONTEND },
  });
  IO.use(socketIOSession(session));
  IO.use(IOAuthenticate);
  IORouter(IO);

  HTTPServer.listen(5000, () => {
    Utils.log("Server running at http://localhost:5000", "INFO");
  });
})();
