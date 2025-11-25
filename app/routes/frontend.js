import { Router } from "express";
import createError from "http-errors";
import pool from '../utils/connectdb.js';

const router = Router();

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/applyroom', function(req, res) {
  res.render('applyroom');
});

router.get('/teacher', async function(req, res) {
  const [rst] = await pool.query('SELECT * FROM applications');
  console.log(rst);
  res.render('teacher', { applies: rst });
});

router.use(function (req, res, next) {
  next(createError(404));
});

export default router;
