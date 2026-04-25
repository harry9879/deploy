import multer from 'multer';

// Use memory storage for serverless (Vercel has no writable disk)
// Files are stored in memory as Buffer objects
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // For now, accept all file types
  // In production, you might want to block certain extensions
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 209715200, // 200MB default
  },
  fileFilter: fileFilter,
});

export default upload;
