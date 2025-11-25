import { Router } from "express";
import createError from "http-errors";

const router = Router();

router.use(function (req, res, next) {
  next(createError(404));
});

export default router;
