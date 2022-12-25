import { Router } from "express";
import AuthRouter from "./auth";
import ApiRouter from "./api";

const router = Router();
router.use("/auth", AuthRouter);
router.use("/api", ApiRouter);

export default router;
