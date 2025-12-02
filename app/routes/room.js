import { Router } from "express";
import createError from "http-errors";
import { verifySession } from "../utils/session.js";
import pool from '../utils/connectdb.js';

const router = Router();

router.get('/', function(req, res) {
  res.status(200).json({ message: "Room API is working", userId: req.session.userId });
});

router.post('/apply', async function(req, res, next) {
  const { name, date, time, reason } = req.body;
  if (!name || !date || !time || !reason) {
    return next(createError(400, "Missing required fields"));
  }
  const [rst] = await pool.query(
    "INSERT INTO applications (students, activity_date, activity_time, activity_description) VALUES (?, ?, ?, ?)",
    [name, date, time, reason]
  );
  return res.status(200).json({ success: true });
});

router.use(function (req, res, next) {
  next(createError(404));
});

export default router;
