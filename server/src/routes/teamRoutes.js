import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getTeamMembers } from '../controllers/teamController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTeamMembers);

export default router;
