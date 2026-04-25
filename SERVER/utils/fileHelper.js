import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';

export const createZipFromFiles = (files, outputPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      resolve({
        path: outputPath,
        size: archive.pointer(),
      });
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    files.forEach(file => {
      archive.file(file.path, { name: file.originalname });
    });

    archive.finalize();
  });
};

export const deleteFile = async (filePath) => {
  try {
    await fsPromises.unlink(filePath);
    console.log(`🗑️  Deleted file: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error.message);
    return false;
  }
};

export const deleteDirectory = async (dirPath) => {
  try {
    await fsPromises.rm(dirPath, { recursive: true, force: true });
    console.log(`🗑️  Deleted directory: ${dirPath}`);
    return true;
  } catch (error) {
    console.error(`Error deleting directory ${dirPath}:`, error.message);
    return false;
  }
};

export const ensureDirectoryExists = async (dirPath) => {
  try {
    await fsPromises.access(dirPath);
  } catch {
    await fsPromises.mkdir(dirPath, { recursive: true });
  }
};

export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

export const getMimeCategory = (mimeType) => {
  if (!mimeType) return 'other';
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
  if (mimeType.includes('text/') || mimeType.includes('document')) return 'document';
  
  return 'other';
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const calculateExpiryTime = (minutes) => {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60 * 1000);
};

export const getTimeRemaining = (expiryTime) => {
  const now = new Date();
  const diff = expiryTime - now;

  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { expired: false, days, hours, minutes };
};

export const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  const uuid = uuidv4().slice(0, 8);
  return `${nameWithoutExt}_${uuid}${ext}`;
};

export default {
  createZipFromFiles,
  deleteFile,
  deleteDirectory,
  ensureDirectoryExists,
  getFileExtension,
  getMimeCategory,
  formatBytes,
  calculateExpiryTime,
  getTimeRemaining,
  generateUniqueFilename,
};
