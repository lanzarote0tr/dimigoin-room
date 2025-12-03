import express from 'express';
import createError from 'http-errors';
import passport from '../utils/passport.js';
import { verifySession, applySession, purgeSession } from '../utils/session.js';

const router = express.Router();

router.get('/session', verifySession, (req, res) => {
  return res.status(200).json({ message: "Session is valid", userId: req.session.userId });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/login-callback', passport.authenticate('google', { failureRedirect: '/login-failed' }), async (req, res, next) => {
  console.log("User authenticated:", req.user.id);
  applySession(req, req.user.id);
  return res.redirect('/app/applyroom');
});

router.post('/logout', verifySession, (req, res, next) => {
  try {
    purgeSession(req.session.id);
    res.clearCookie('sessionId');
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return next(createError(500, "Failed to log out"));
  }
});

export default router;
