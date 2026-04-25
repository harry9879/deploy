import express from 'express';
import {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);

router.get('/me', protect, getMe);
router.post('/resend-verification', protect, resendVerification);

export default router;
