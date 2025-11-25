import { Router } from "express";
import createError from "http-errors";
import { verifySession } from "../utils/session.js";
import pool from '../utils/connectdb.js';

const router = Router();

router.get('/', function(req, res) {
  res.status(200).json({ message: "Room API is working", userId: req.session.userId });
});

router.post('/apply', async function(req, res, next) {
  const { student, date, time, description } = req.body;
  if (!student || !date || !time || !description) {
    return next(createError(400, "Missing required fields"));
  }
  const [rst] = await pool.query(
    "INSERT INTO room_applications (students, activity_date, activity_time, activity_description) VALUES (?, ?, ?, ?)",
    [student, date, time, description]
  );
  return res.status(200).json({ success: true });
});

router.use(function (req, res, next) {
  next(createError(404));
});

export default router;
