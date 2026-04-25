import express from 'express';
import {
  uploadFiles,
  getFileMetadata,
  verifyPin,
  downloadFile,
  streamFile,
} from '../controllers/fileController.js';
import { protect, requireEmailVerification } from '../middleware/auth.js';
import { checkUserStorage, checkGlobalStorage } from '../middleware/storage.js';
import upload from '../config/multer.js';

const router = express.Router();

router.post(
  '/upload',
  protect,
  requireEmailVerification,
  upload.array('files', 10),
  checkUserStorage,
  checkGlobalStorage,
  uploadFiles
);

router.get('/:uuid', getFileMetadata);
router.post('/:uuid/verify-pin', verifyPin);
router.get('/:uuid/download', downloadFile);
router.get('/:uuid/stream', streamFile);

export default router;
