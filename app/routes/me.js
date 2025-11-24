import express from 'express';
import { verifySession } from '../utils/session.js';

const router = express.Router();

// Get current user
router.get('/', verifySession, async (req, res, next) => {
  // TODO: Fetch user from database
  res.status(200).json({ message: 'User profile', userId: req.session.userId });
});

export default router;
