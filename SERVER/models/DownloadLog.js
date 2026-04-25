import mongoose from 'mongoose';

const downloadLogSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  success: {
    type: Boolean,
    default: true,
  },
  action: {
    type: String,
    enum: ['download', 'preview', 'stream'],
    default: 'download',
  },
}, {
  timestamps: false,
});

downloadLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 864000 });

downloadLogSchema.index({ fileId: 1, timestamp: -1 });

const DownloadLog = mongoose.model('DownloadLog', downloadLogSchema);

export default DownloadLog;
