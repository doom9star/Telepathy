import RedisStore from "connect-redis";
import { RequestHandler } from "express";
import session from "express-session";
import { createClient, RedisClientType } from "redis";
import { _24HRS } from "./constants";
import { Utils } from "./utils";

export class RedisAuthSession {
  public static client?: RedisClientType;
  public static session?: RequestHandler;

  static connect(): Promise<RequestHandler> | RequestHandler {
    if (this.session) return this.session;
    return new Promise((res, rej) => {
      this.client = createClient();

      this.client.connect();

      this.client.on("connect", () => {
        const store = new RedisStore({ client: this.client });
        this.session = session({
          store,
          secret: process.env.SESSION_SECRET!,
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
        res(this.session);
      });
      this.client.on("error", (err) => {
        Utils.log(err, "ERROR");
        rej(err);
      });
    });
  }
}
