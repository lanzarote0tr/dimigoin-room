import { Router } from "express";
import authRouter from "./auth.js";
import meRouter from "./me.js";
import projectsRouter from "./projects.js";
import createError from "http-errors";
import { verifySession } from "../utils/session.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/me", verifySession, meRouter);
router.use("/projects", verifySession, projectsRouter);

router.use(function (req, res, next) {
  next(createError(404));
});

export default router;
