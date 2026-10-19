import express from 'express';
import { register, login } from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator,
} from '../validators/authValidators.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authLimiter);

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

export default router;
