import createRedisStore, { RedisStore } from "connect-redis";
import { RequestHandler } from "express";
import session from "express-session";
import { createClient, RedisClient } from "redis";
import { _24HRS } from "./constants";
import { Utils } from "./utils";

export class RedisAuthSession {
  public static client?: RedisClient;
  public static session?: RequestHandler;

  static connect(): Promise<RequestHandler> | RequestHandler {
    if (this.session) return this.session;
    return new Promise((res, rej) => {
      this.client = createClient({
        host: "localhost",
        port: 6379,
      });
      this.client.on("connect", () => {
        const store: RedisStore = createRedisStore(session);
        this.session = session({
          store: new store({ client: this.client }),
          secret: process.env.session_secret || "",
          resave: false,
          saveUninitialized: false,
          name: "sid",
          cookie: {
            secure: false,
            httpOnly: true,
            maxAge: _24HRS,
          },
        });
        Utils.log(`Redis connected at http://localhost:6379`, "INFO");
        // this.client?.flushall();
        res(this.session);
      });
      this.client.on("error", (err) => {
        Utils.log(err, "ERROR");
        rej(err);
      });
    });
  }
}
