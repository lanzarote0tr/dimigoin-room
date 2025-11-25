import { Router } from "express";
import createError from "http-errors";

const router = Router();

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/applyroom', function(req, res) {
  res.render('applyroom');
});

router.get('/teacher', function(req, res) {
  const [rst] = req.query('SELECT * FROM applications');
  console.log(rst);
  res.render('teacher', { applies: rst });
});

router.use(function (req, res, next) {
  next(createError(404));
});

export default router;
