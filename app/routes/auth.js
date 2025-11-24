import express from 'express';
import createError from 'http-errors';
import pool from '../utils/connectdb.js';
import { verifySession, applySession, purgeSession, refreshSession } from '../utils/session.js';

const router = express.Router();

router.get('/session', verifySession, (req, res) => {
  return res.status(200).json({ message: "Session is valid", userId: req.session.userId });
});

router.get('/login', async(req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })
});

router.get('/login-callback', async(req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  }
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
