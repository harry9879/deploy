import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  originalFilenames: [{
    type: String,
    required: true,
  }],
  storedPath: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  uploadTime: {
    type: Date,
    default: Date.now,
  },
  expiryTime: {
    type: Date,
    required: true,
    index: true,
  },
  maxDownloads: {
    type: Number,
    default: null,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  senderEmail: {
    type: String,
    trim: true,
  },
  receiverEmails: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  message: {
    type: String,
    maxlength: 400,
  },
  pinHash: {
    type: String,
    default: null,
  },
  pinAttempts: {
    type: Number,
    default: 0,
  },
  pinLockedUntil: {
    type: Date,
    default: null,
  },
  isZipped: {
    type: Boolean,
    default: false,
  },
  contentTypes: [{
    type: String,
  }],
  isProtected: {
    type: Boolean,
    default: false,
  },
  isExpired: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

fileSchema.index({ expiryTime: 1, isExpired: 1 });
fileSchema.index({ ownerId: 1, createdAt: -1 });

fileSchema.virtual('expired').get(function() {
  if (this.isExpired) return true;
  
  const now = new Date();
  const timeExpired = this.expiryTime < now;
  const downloadExpired = this.maxDownloads && this.downloadCount >= this.maxDownloads;
  
  return timeExpired || downloadExpired;
});

fileSchema.methods.canDownload = function() {
  const now = new Date();
  
  if (this.expiryTime < now) {
    return { allowed: false, reason: 'File has expired' };
  }
  
  if (this.maxDownloads && this.downloadCount >= this.maxDownloads) {
    return { allowed: false, reason: 'Download limit reached' };
  }
  
  return { allowed: true };
};

fileSchema.methods.isPinLocked = function() {
  if (!this.pinLockedUntil) return false;
  return new Date() < this.pinLockedUntil;
};

fileSchema.methods.incrementDownload = async function() {
  this.downloadCount += 1;
  
  if (this.maxDownloads && this.downloadCount >= this.maxDownloads) {
    this.isExpired = true;
  }
  
  await this.save();
};

fileSchema.set('toJSON', { virtuals: true });
fileSchema.set('toObject', { virtuals: true });

const File = mongoose.model('File', fileSchema);

export default File;
