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

router.get('/login-callback', passport.authenticate('google', { failureRedirect: '/login-failed' }), async (req, res, next) => {
  if (!req.user) {
    return next(createError(500, "No user info from Google"));
  }
  const userId = req.user._json.sub
  const userPic = req.user._json.picture;
  const displayName = req.user._json.name;
  const [rst] = await pool.query(
    "SELECT id FROM users WHERE id = ?",
    [userId]
  );
  if (rst.length === 0) {
    // New user, create session after inserting into DB
    await pool.query(
      "INSERT IGNORE INTO users (id, name, picture, role) VALUES (?, ?, ?, 'student')",
      [userId, displayName, userPic]
    );
  } else {
    // Existing user, update profile info
    await pool.query(
      "UPDATE users SET name = ?, picture = ? WHERE id = ?",
      [displayName, userPic, userId]
    );
  }
  applySession(req, next, userId);
  return res.redirect('/app/applyroom');
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
