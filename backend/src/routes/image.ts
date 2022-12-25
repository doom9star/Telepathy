import { v2 } from "cloudinary";
import { Response, Router } from "express";
import multer from "multer";
import Image from "../entity/Image";
import User from "../entity/User";
import { RestAuthenticate } from "../ts/middleware";
import { RestSessionRequest } from "../ts/types";
import { Utils } from "../ts/utils";

const storage = multer.memoryStorage();
const imageUploader = multer({
  storage,
  fileFilter: (_, file, callback) => {
    if (file) {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/png")
        callback(null, true);
      else callback(new Error("Invalid File Type!"));
    }
  },
});

const router = Router();
router.use("*", function (_1, _2, next) {
  Utils.connectCloudinary();
  next();
});

router.post(
  "/avatar",
  RestAuthenticate,
  imageUploader.single("image"),
  async (req: RestSessionRequest, res: Response): Promise<Response> => {
    const user = await User.findOne({
      where: { id: req.session.uid },
      relations: ["avatar"],
    });
    if (!user) return res.json(Utils.getResponse(404, "User not found!"));

    if (!req.file)
      return res.json(Utils.getResponse(400, "Error in transmission!"));
    const dataURI = Utils.toDataURI(req.file.originalname, req.file.buffer);
    if (!dataURI)
      return res.json(Utils.getResponse(400, "Data URI parsing error!"));

    const result = await v2.uploader.upload(dataURI);

    if (user.avatar) {
      await v2.uploader.destroy(user.avatar.cid);
      await user.avatar.remove();
    }
    const avatar = new Image();
    avatar.url = result.secure_url;
    avatar.cid = result.public_id;
    user.avatar = avatar;
    await user.save();

    return res.json(Utils.getResponse(200, user));
  }
);

router.delete(
  "/avatar",
  RestAuthenticate,
  async (req: RestSessionRequest, res: Response): Promise<Response> => {
    const user = await User.findOne({
      where: { id: req.session.uid },
      relations: ["avatar"],
    });
    if (!user) return res.json(Utils.getResponse(404, "User not found!"));

    await v2.uploader.destroy(user.avatar.cid);
    await user.avatar.remove();
    await user.save();

    return res.json(Utils.getResponse(200));
  }
);

export default router;
