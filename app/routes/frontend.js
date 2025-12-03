import { Router } from "express";
import createError from "http-errors";
import pool from '../utils/connectdb.js';
import { verifySession } from "../utils/session.js";

const router = Router();

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/applyroom', verifySession, function(req, res) {
  res.render('applyroom');
});

router.get('/viewapplies', verifySession, async function(req, res) {
  const [rst] = await pool.query(
    'SELECT * FROM applications WHERE rep = ?',
    [req.session.userId]
  );
  res.render('viewapplies', { applies: rst });
});

router.get('/teacher', async function(req, res) { // TODO: verifySession and check if user is teacher
  const [rst] = await pool.query('SELECT * FROM applications');
  res.render('teacher', { applies: rst });
});

router.use(function (req, res, next) {
  next(createError(404));
});

export default router;
