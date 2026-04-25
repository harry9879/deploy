import File from '../models/File.js';
import User from '../models/User.js';
import DownloadLog from '../models/DownloadLog.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { 
  createZipFromFiles, 
  deleteFile, 
  calculateExpiryTime,
  getMimeCategory 
} from '../utils/fileHelper.js';
import { sendFileShareEmail, validateEmails } from '../utils/email.js';
import { uploadFileToS3, getDownloadUrl, getFileStreamFromS3 } from '../utils/s3.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFiles = async (req, res) => {
  try {
    const {
      expiryMinutes,
      expiryHours,
      maxDownloads,
      receiverEmails,
      message,
      pin,
    } = req.body;

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    let totalMinutes = 0;
    if (expiryHours) {
      totalMinutes += parseInt(expiryHours) * 60;
    }
    if (expiryMinutes) {
      totalMinutes += parseInt(expiryMinutes);
    }
    
    if (totalMinutes === 0) {
      totalMinutes = 24 * 60;
    }

    if (totalMinutes < 5 || totalMinutes > 24 * 60) {
      return res.status(400).json({
        success: false,
        message: 'Expiry time must be between 5 minutes and 24 hours',
      });
    }

    const expiryTime = calculateExpiryTime(totalMinutes);

    let receiverEmailArray = [];
    if (receiverEmails) {
      receiverEmailArray = typeof receiverEmails === 'string' 
        ? receiverEmails.split(',').map(e => e.trim()).filter(e => e)
        : receiverEmails;

      if (receiverEmailArray.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 5 recipient emails allowed',
        });
      }

      const { validEmails, invalidEmails } = validateEmails(receiverEmailArray);
      
      if (invalidEmails.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email addresses found',
          invalidEmails,
        });
      }

      receiverEmailArray = validEmails;
    }

    if (message && message.length > 400) {
      return res.status(400).json({
        success: false,
        message: 'Message must be 400 characters or less',
      });
    }

    let pinHash = null;
    let isProtected = false;
    
    if (pin) {
      if (!/^\d{4}$/.test(pin)) {
        return res.status(400).json({
          success: false,
          message: 'PIN must be exactly 4 digits',
        });
      }
      
      const salt = await bcrypt.genSalt(10);
      pinHash = await bcrypt.hash(pin, salt);
      isProtected = true;
    }

    const fileUuid = uuidv4();
    const userId = req.user._id.toString();
    const fileDir = path.join(__dirname, '../uploads', userId, fileUuid);

    await fsPromises.mkdir(fileDir, { recursive: true });

    let storedPath;
    let finalSize;
    let isZipped = false;
    const originalFilenames = files.map(f => f.originalname);
    const contentTypes = files.map(f => f.mimetype);

    if (files.length > 1) {
      const zipPath = path.join(fileDir, `files_${fileUuid}.zip`);
      const zipResult = await createZipFromFiles(files, zipPath);
      
      storedPath = zipResult.path;
      finalSize = zipResult.size;
      isZipped = true;

      for (const file of files) {
        await deleteFile(file.path);
      }
    } else {
      const singleFile = files[0];
      storedPath = path.join(fileDir, singleFile.originalname);
      await fsPromises.rename(singleFile.path, storedPath);
      finalSize = singleFile.size;
    }

    let finalStoredPath = storedPath;
    let isS3 = false;

    // Check if S3 is configured
    if (process.env.AWS_ACCESS_KEY_ID && process.env.TIGRIS_BUCKET) {
      const s3Key = `${userId}/${fileUuid}/${isZipped ? `files_${fileUuid}.zip` : files[0].originalname}`;
      await uploadFileToS3(storedPath, s3Key, isZipped ? 'application/zip' : files[0].mimetype);
      finalStoredPath = `s3://${s3Key}`;
      isS3 = true;
      
      // Delete local file after S3 upload
      await fsPromises.unlink(storedPath);
    }

    const fileRecord = await File.create({
      uuid: fileUuid,
      ownerId: req.user._id,
      originalFilenames,
      storedPath: finalStoredPath,
      size: finalSize,
      uploadTime: new Date(),
      expiryTime,
      maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
      downloadCount: 0,
      senderEmail: req.user.email,
      receiverEmails: receiverEmailArray,
      message: message || '',
      pinHash,
      isZipped,
      contentTypes,
      isProtected,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: finalSize },
    });

    const downloadLink = `${process.env.FRONTEND_URL}/download/${fileUuid}`;

    if (receiverEmailArray.length > 0) {
      try {
        await sendFileShareEmail(receiverEmailArray, {
          senderName: req.user.name,
          senderEmail: req.user.email,
          message: message || '',
          downloadLink,
          filenames: originalFilenames,
          fileSize: finalSize,
          expiryTime,
          isProtected,
        });
      } catch (emailError) {
        console.error('Error sending file share email:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        fileId: fileRecord._id,
        uuid: fileUuid,
        link: downloadLink,
        expiryTime,
        originalFilenames,
        size: finalSize,
        isProtected,
        emailSent: receiverEmailArray.length > 0,
      },
      storageWarning: req.storageWarning || null,
      globalStorageWarning: req.globalStorageWarning || null,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message,
    });
  }
};

export const getFileMetadata = async (req, res) => {
  try {
    const { uuid } = req.params;

    const file = await File.findOne({ uuid }).populate('ownerId', 'name email');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Check if file can be downloaded
    const downloadCheck = file.canDownload();

    res.status(200).json({
      success: true,
      data: {
        uuid: file.uuid,
        originalFilenames: file.originalFilenames,
        size: file.size,
        uploadTime: file.uploadTime,
        expiryTime: file.expiryTime,
        downloadCount: file.downloadCount,
        maxDownloads: file.maxDownloads,
        isProtected: file.isProtected,
        isZipped: file.isZipped,
        contentTypes: file.contentTypes,
        canDownload: downloadCheck.allowed,
        downloadMessage: downloadCheck.reason || null,
        sender: {
          name: file.ownerId.name,
          email: file.senderEmail,
        },
        message: file.message,
      },
    });
  } catch (error) {
    console.error('Get metadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file metadata',
      error: error.message,
    });
  }
};

export const verifyPin = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { pin } = req.body;

    const file = await File.findOne({ uuid });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    if (!file.isProtected) {
      return res.status(400).json({
        success: false,
        message: 'File is not password protected',
      });
    }

    if (file.isPinLocked()) {
      const remainingTime = Math.ceil((file.pinLockedUntil - new Date()) / 1000 / 60);
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Please try again in ${remainingTime} minutes.`,
        lockedUntil: file.pinLockedUntil,
      });
    }

    const isPinValid = await bcrypt.compare(pin, file.pinHash);

    if (!isPinValid) {
      file.pinAttempts += 1;

      if (file.pinAttempts >= 9) {
        file.pinLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        file.pinAttempts = 0; // Reset attempts
      }

      await file.save();

      const attemptsRemaining = 9 - file.pinAttempts;

      return res.status(401).json({
        success: false,
        message: 'Invalid PIN',
        attemptsRemaining: attemptsRemaining > 0 ? attemptsRemaining : 0,
      });
    }

    file.pinAttempts = 0;
    file.pinLockedUntil = null;
    await file.save();

    res.status(200).json({
      success: true,
      message: 'PIN verified successfully',
    });
  } catch (error) {
    console.error('PIN verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying PIN',
      error: error.message,
    });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const { uuid } = req.params;

    const file = await File.findOne({ uuid });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Check if file can be downloaded
    const downloadCheck = file.canDownload();
    
    if (!downloadCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: downloadCheck.reason,
      });
    }

    const isS3 = file.storedPath.startsWith('s3://');

    // Check if file exists (locally or we assume it exists in S3)
    if (!isS3) {
      try {
        await fsPromises.access(file.storedPath);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'File not found on server',
        });
      }
    }

    // Get client IP and user agent
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Log the download
    await DownloadLog.create({
      fileId: file._id,
      timestamp: new Date(),
      ip: clientIp,
      userAgent,
      userId: req.user ? req.user._id : null,
      success: true,
      action: 'download',
    });

    // Increment download count
    await file.incrementDownload();

    // Set headers for download
    const filename = file.isZipped 
      ? `files_${uuid}.zip` 
      : file.originalFilenames[0];

    if (isS3) {
      const s3Key = file.storedPath.replace('s3://', '');
      const downloadUrl = await getDownloadUrl(s3Key, 3600); // 1 hour valid
      // Return presigned URL as JSON — client must use window.location.href
      // (fetch + credentials:include + redirect breaks on S3 CORS)
      return res.json({ success: true, downloadUrl, filename });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', file.isZipped ? 'application/zip' : file.contentTypes[0]);
    
    // Support range requests for resume capability
    const stat = await fsPromises.stat(file.storedPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
      });

      const readStream = fs.createReadStream(file.storedPath, { start, end });
      readStream.pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      const readStream = fs.createReadStream(file.storedPath);
      readStream.pipe(res);
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message,
    });
  }
};

export const streamFile = async (req, res) => {
  try {
    const { uuid } = req.params;

    const file = await File.findOne({ uuid });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const downloadCheck = file.canDownload();
    
    if (!downloadCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: downloadCheck.reason,
      });
    }

    if (file.isZipped) {
      return res.status(400).json({
        success: false,
        message: 'Cannot stream zipped files. Please download instead.',
      });
    }

    const isS3 = file.storedPath.startsWith('s3://');

    // Check if file exists on disk
    if (!isS3) {
      try {
        await fsPromises.access(file.storedPath);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'File not found on server',
        });
      }
    }

    // Get client IP and user agent
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Log the stream
    await DownloadLog.create({
      fileId: file._id,
      timestamp: new Date(),
      ip: clientIp,
      userAgent,
      userId: req.user ? req.user._id : null,
      success: true,
      action: 'stream',
    });

    const range = req.headers.range;

    if (isS3) {
      const s3Key = file.storedPath.replace('s3://', '');
      // For stream (preview), redirect to presigned URL — works fine for <img>/<iframe>
      const streamUrl = await getDownloadUrl(s3Key, 3600);
      return res.redirect(streamUrl);
    }

    const stat = await fsPromises.stat(file.storedPath);
    const fileSize = stat.size;

    res.setHeader('Content-Type', file.contentTypes[0]);
    res.setHeader('Accept-Ranges', 'bytes');

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunksize,
      });

      const readStream = fs.createReadStream(file.storedPath, { start, end });
      readStream.pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      const readStream = fs.createReadStream(file.storedPath);
      readStream.pipe(res);
    }
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({
      success: false,
      message: 'Error streaming file',
      error: error.message,
    });
  }
};

export default {
  uploadFiles,
  getFileMetadata,
  verifyPin,
  downloadFile,
  streamFile,
};
