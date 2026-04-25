import express from 'express';
import {
  getUserUploads,
  extendExpiry,
  deleteUserFile,
  getFileLogs,
  getUserAnalytics,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/uploads', getUserUploads);
router.get('/analytics', getUserAnalytics);
router.post('/files/:id/extend', extendExpiry);
router.delete('/files/:id', deleteUserFile);
router.get('/files/:id/logs', getFileLogs);

export default router;
