import bcrypt from "bcryptjs";
import { validate } from "class-validator";
import { Request, Response, Router } from "express";
import { v4 } from "uuid";
import User from "../entity/User";
import {
  ACTIVATE_PASSWORD_PREFIX,
  FORGOT_PASSWORD_PREFIX,
} from "../ts/constants";
import { RestAuthenticate } from "../ts/middleware";
import { RedisAuthSession } from "../ts/redis";
import { RestSessionRequest } from "../ts/types";
import { Utils } from "../ts/utils";

const router = Router();

router.get(
  "/me",
  RestAuthenticate,
  async (req: RestSessionRequest, res: Response): Promise<Response> => {
    const uid = req.session.uid;
    const user = await User.findOne({
      where: { id: uid },
      relations: ["avatar"],
    });
    return res.json(Utils.getResponse(200, user));
  }
);

router.post(
  "/register",
  async (req: Request, res: Response): Promise<Response> => {
    const { email, username, password } = req.body;
    const user = new User();
    user.email = email;
    user.username = username;
    user.password = password;

    const errors = await validate(user, {
      validationError: { target: false, value: false },
    });
    if (errors.length > 0)
      return res.json(
        Utils.getResponse(
          400,
          errors.map((err) => ({ [err.property]: err.constraints }))
        )
      );

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    const client = RedisAuthSession.client;
    if (!client) return res.json(Utils.getResponse(500));

    const uid = v4();
    client.set(`${ACTIVATE_PASSWORD_PREFIX}${uid}`, user.id);

    Utils.sendEmail({
      from: process.env.EMAIL!,
      to: email,
      subject: "Telepathy Account Activation",
      html: `<h1 style="color:#1F51FF;">Warm welcome from Telepathy!</h1><br /><p>Your one step away from entering our chat world!</p><p>Visit this link to activate your account <a href="${process.env.FRONTEND}/activate/${uid}" style="color:#1F51FF">activate</a>.</p>`,
    });

    return res.json(Utils.getResponse(201));
  }
);

router.post(
  "/login",
  async (req: RestSessionRequest, res: Response): Promise<Response> => {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email: email },
      relations: ["avatar"],
    });
    if (!user)
      return res.json(
        Utils.getResponse(404, { message: "Email doesn't exist!" })
      );

    const valid: boolean = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.json(Utils.getResponse(401, { message: "Wrong Password!" }));

    if (!user.activated)
      return res.json(
        Utils.getResponse(401, {
          message: "Account must be activated before login!",
        })
      );
    req.session.uid = user.id;
    return res.json(Utils.getResponse(200, user));
  }
);

router.delete(
  "/logout",
  RestAuthenticate,
  (req: Request, res: Response): Response | void => {
    req.session.destroy((error: any): Response => {
      if (error) return res.json(Utils.getResponse(500));
      return res.clearCookie("sid").json(Utils.getResponse(200));
    });
  }
);

router.post(
  "/forgot-password",
  async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;
    const client = RedisAuthSession.client;
    if (!client) return res.json(Utils.getResponse(500));

    const user = await User.findOne({ where: { email: email } });
    if (!user) return res.json(Utils.getResponse(404, "Email doesn't exist!"));
    if (!user.activated)
      return res.json(Utils.getResponse(401, "Account must be activated!"));

    const uid = v4();
    client.set(`${FORGOT_PASSWORD_PREFIX}${uid}`, user.id);

    Utils.sendEmail({
      from: process.env.EMAIL!,
      to: email,
      subject: "Telepathy Reset Password",
      html: `<h1 style="color:#1F51FF;">You have requested to reset your password!</h1><br /><p>Visit this link to reset your password <a href="${process.env.FRONTEND}/reset-password/${uid}" style="color:#1F51FF">reset</a>.</p>`,
    });

    return res.json(Utils.getResponse(200));
  }
);

router.post(
  "/reset-password/:uid",
  async (req: Request, res: Response): Promise<Response> => {
    const { uid } = req.params;
    const client = RedisAuthSession.client;
    if (!client) return res.json(Utils.getResponse(500));

    const id = await client.get(`${FORGOT_PASSWORD_PREFIX}${uid}`);

    if (!id) return res.json(Utils.getResponse(401));

    const { password } = req.body;
    if (!password) return res.json(Utils.getResponse(400));

    const user = await User.findOne({ where: { id: id } });
    if (!user) return res.json(Utils.getResponse(404));
    user.password = await bcrypt.hash(password, 12);
    user.save();

    client.del(`${FORGOT_PASSWORD_PREFIX}${uid}`);
    return res.json(Utils.getResponse(200));
  }
);

router.post(
  "/activate/:uid",
  async (req: Request, res: Response): Promise<Response> => {
    const { uid } = req.params;
    const client = RedisAuthSession.client;
    if (!client) return res.json(Utils.getResponse(500));
    const id = await client.get(`${ACTIVATE_PASSWORD_PREFIX}${uid}`);

    if (!id) return res.json(Utils.getResponse(404));

    const user = await User.findOne({ where: { id: id } });
    if (!user) return res.json(Utils.getResponse(401));
    if (user.activated)
      return res.json(Utils.getResponse(200, "Account already activated!"));
    user.activated = true;
    await user.save();

    return res.json(Utils.getResponse(200));
  }
);

export default router;
