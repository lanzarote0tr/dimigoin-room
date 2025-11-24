import express from 'express';
import { verifySession } from '../utils/session.js';

const router = express.Router();

// Get all projects
router.get('/', verifySession, async (req, res, next) => {
  // TODO: Fetch projects from database
  res.status(200).json({ message: 'List of projects' });
});

export default router;
