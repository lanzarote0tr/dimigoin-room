import express from 'express';
import createError from 'http-errors';
import pool from '../utils/connectdb.js';
import passport from '../utils/passport.js';
import { verifySession, applySession, purgeSession, refreshSession } from '../utils/session.js';

const router = express.Router();

router.get('/session', verifySession, (req, res) => {
  return res.status(200).json({ message: "Session is valid", userId: req.session.userId });
});

router.get('/login', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/login-callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res, next) => {
    if (!req.user) {
      console.log('No Google user info available');
      return next();
    }

    // Common fields provided by passport-google-oauth
    const {
      id,
      displayName,
      name,
      emails,
      photos,
      provider,
      _json // raw Google profile JSON
    } = req.user;

    console.log('Google user info:');
    console.log('id:', id);
    console.log('displayName:', displayName);
    console.log('name:', name);
    console.log('emails:', emails);
    console.log('photos:', photos);
    console.log('provider:', provider);
    console.log('raw profile (_json):', _json);

    next();
  },
  async (req, res, next) => {
    try {
      //await applySession(req, res, req.user.id);
      res.redirect('/index');
    } catch (err) {
      return next(createError(500, "Failed to apply session"));
    }
  }
);

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
