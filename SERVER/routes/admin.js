import express from 'express';
import {
  getGlobalAnalytics,
  getAllUsers,
  clearAnalyticsCache,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(adminOnly);

router.get('/analytics', getGlobalAnalytics);
router.get('/users', getAllUsers);
router.post('/clear-cache', clearAnalyticsCache);

export default router;
