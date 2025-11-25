import { Router } from "express";
import authRouter from "./auth.js";
import roomRouter from "./room.js";

import createError from "http-errors";
import { verifySession } from "../utils/session.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/room", verifySession, roomRouter);

router.use(function (req, res, next) {
  next(createError(404));
});

export default router;
