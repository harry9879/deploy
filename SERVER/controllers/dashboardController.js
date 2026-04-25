import File from '../models/File.js';
import User from '../models/User.js';
import DownloadLog from '../models/DownloadLog.js';
import { deleteFile, deleteDirectory, calculateExpiryTime } from '../utils/fileHelper.js';
import { deleteFileFromS3 } from '../utils/s3.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUserUploads = async (req, res) => {
  try {
    const { search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

    const query = { ownerId: req.user._id };

    if (search) {
      query.$or = [
        { originalFilenames: { $regex: search, $options: 'i' } },
        { receiverEmails: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const files = await File.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await File.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching uploads',
      error: error.message,
    });
  }
};

export const extendExpiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { extensionType, customHours } = req.body;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Check ownership
    if (file.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only extend your own files',
      });
    }

    let newExpiryTime;
    const currentTime = new Date();

    switch (extensionType) {
      case '24hours':
        newExpiryTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (!customHours || customHours < 1 || customHours > 24) {
          return res.status(400).json({
            success: false,
            message: 'Custom hours must be between 1 and 24',
          });
        }
        newExpiryTime = new Date(currentTime.getTime() + customHours * 60 * 60 * 1000);
        break;
      case 'double':
        const remainingTime = file.expiryTime - currentTime;
        if (remainingTime <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Cannot extend expired file. File must be re-uploaded.',
          });
        }
        newExpiryTime = new Date(currentTime.getTime() + remainingTime * 2);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid extension type',
        });
    }

    file.expiryTime = newExpiryTime;
    file.isExpired = false;
    await file.save();

    res.status(200).json({
      success: true,
      message: 'File expiry extended successfully',
      data: {
        newExpiryTime,
      },
    });
  } catch (error) {
    console.error('Extend expiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error extending file expiry',
      error: error.message,
    });
  }
};

export const deleteUserFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Check ownership
    if (file.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own files',
      });
    }

    // Delete file from disk or S3
    if (file.storedPath.startsWith('s3://')) {
      const s3Key = file.storedPath.replace('s3://', '');
      await deleteFileFromS3(s3Key);
    } else {
      const fileDir = path.dirname(file.storedPath);
      await deleteDirectory(fileDir);
    }

    // Update user storage
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: -file.size },
    });

    // Delete file record
    await File.findByIdAndDelete(id);

    // Delete download logs for this file
    await DownloadLog.deleteMany({ fileId: id });

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message,
    });
  }
};

export const getFileLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Check ownership
    if (file.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view logs for your own files',
      });
    }

    const logs = await DownloadLog.find({ fileId: id })
      .sort({ timestamp: -1 })
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: {
        logs,
        totalDownloads: logs.filter(l => l.action === 'download').length,
        totalStreams: logs.filter(l => l.action === 'stream').length,
      },
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching download logs',
      error: error.message,
    });
  }
};

export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's total files
    const totalFiles = await File.countDocuments({ ownerId: userId });
    const activeFiles = await File.countDocuments({ ownerId: userId, isExpired: false });
    const expiredFiles = await File.countDocuments({ ownerId: userId, isExpired: true });

    // Get total downloads
    const userFiles = await File.find({ ownerId: userId }).select('_id downloadCount');
    const totalDownloads = userFiles.reduce((sum, file) => sum + file.downloadCount, 0);

    // Get storage info
    const user = await User.findById(userId);
    const storageUsed = user.storageUsed;
    const maxStorage = parseInt(process.env.MAX_USER_STORAGE) || 524288000;
    const storagePercentage = (storageUsed / maxStorage) * 100;

    // Get recent activity
    const recentUploads = await File.find({ ownerId: userId })
      .sort({ uploadTime: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalFiles,
        activeFiles,
        expiredFiles,
        totalDownloads,
        storage: {
          used: storageUsed,
          max: maxStorage,
          percentage: storagePercentage.toFixed(2),
          available: maxStorage - storageUsed,
        },
        recentUploads,
      },
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};

export default {
  getUserUploads,
  extendExpiry,
  deleteUserFile,
  getFileLogs,
  getUserAnalytics,
};
