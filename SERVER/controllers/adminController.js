import File from '../models/File.js';
import User from '../models/User.js';
import DownloadLog from '../models/DownloadLog.js';
import { getMimeCategory } from '../utils/fileHelper.js';

// Cache for analytics (5 minutes)
let analyticsCache = null;
let analyticsCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000;

export const getGlobalAnalytics = async (req, res) => {
  try {
    const { dateRange = '7days' } = req.query;

    // Check cache
    const now = Date.now();
    if (analyticsCache && analyticsCacheTime && (now - analyticsCacheTime < CACHE_DURATION)) {
      return res.status(200).json({
        success: true,
        data: analyticsCache,
        cached: true,
      });
    }

    // Calculate date range
    let startDate;
    const endDate = new Date();

    switch (dateRange) {
      case '7days':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1month':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Total users
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate },
    });

    // Total files
    const totalFiles = await File.countDocuments();
    const activeFiles = await File.countDocuments({ isExpired: false });
    const expiredFiles = await File.countDocuments({ isExpired: true });
    const filesInRange = await File.countDocuments({
      uploadTime: { $gte: startDate, $lte: endDate },
    });

    // Total downloads
    const totalDownloadsResult = await File.aggregate([
      { $group: { _id: null, total: { $sum: '$downloadCount' } } },
    ]);
    const totalDownloads = totalDownloadsResult.length > 0 ? totalDownloadsResult[0].total : 0;

    const downloadsInRange = await DownloadLog.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
      action: 'download',
    });

    // Storage statistics
    const storageResult = await File.aggregate([
      { $match: { isExpired: false } },
      { $group: { _id: null, totalSize: { $sum: '$size' } } },
    ]);
    const totalStorageUsed = storageResult.length > 0 ? storageResult[0].totalSize : 0;
    const maxGlobalStorage = parseInt(process.env.MAX_GLOBAL_STORAGE) || 10737418240;
    const storagePercentage = (totalStorageUsed / maxGlobalStorage) * 100;

    // File types distribution
    const fileTypeStats = await File.aggregate([
      { $match: { isExpired: false } },
      { $unwind: '$contentTypes' },
      { $group: { _id: '$contentTypes', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Map MIME types to categories
    const categorizedFileTypes = {};
    fileTypeStats.forEach(item => {
      const category = getMimeCategory(item._id);
      categorizedFileTypes[category] = (categorizedFileTypes[category] || 0) + item.count;
    });

    // Top file sizes
    const largestFiles = await File.find({ isExpired: false })
      .sort({ size: -1 })
      .limit(10)
      .populate('ownerId', 'name email')
      .select('originalFilenames size uploadTime downloadCount');

    // Most downloaded files
    const mostDownloaded = await File.find()
      .sort({ downloadCount: -1 })
      .limit(10)
      .populate('ownerId', 'name email')
      .select('originalFilenames size uploadTime downloadCount expiryTime');

    // Daily upload trend (last 7 days)
    const uploadTrend = await File.aggregate([
      {
        $match: {
          uploadTime: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$uploadTime' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Daily download trend
    const downloadTrend = await DownloadLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          action: 'download',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top users by storage
    const topUsersByStorage = await User.find()
      .sort({ storageUsed: -1 })
      .limit(10)
      .select('name email storageUsed createdAt');

    // Top users by uploads
    const topUsersByUploads = await File.aggregate([
      { $group: { _id: '$ownerId', uploadCount: { $sum: 1 } } },
      { $sort: { uploadCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          uploadCount: 1,
          name: '$user.name',
          email: '$user.email',
        },
      },
    ]);

    const analyticsData = {
      overview: {
        totalUsers,
        newUsers,
        totalFiles,
        activeFiles,
        expiredFiles,
        filesInRange,
        totalDownloads,
        downloadsInRange,
      },
      storage: {
        used: totalStorageUsed,
        max: maxGlobalStorage,
        percentage: storagePercentage.toFixed(2),
        available: maxGlobalStorage - totalStorageUsed,
        warning: storagePercentage >= 90,
      },
      fileTypes: categorizedFileTypes,
      trends: {
        uploads: uploadTrend,
        downloads: downloadTrend,
      },
      topContent: {
        largestFiles,
        mostDownloaded,
      },
      topUsers: {
        byStorage: topUsersByStorage,
        byUploads: topUsersByUploads,
      },
      dateRange: {
        from: startDate,
        to: endDate,
        type: dateRange,
      },
    };

    // Cache the results
    analyticsCache = analyticsData;
    analyticsCacheTime = now;

    res.status(200).json({
      success: true,
      data: analyticsData,
      cached: false,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(query)
      .select('-passwordHash -emailVerificationToken')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    // Get file counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const fileCount = await File.countDocuments({ ownerId: user._id });
        const downloadCount = await File.aggregate([
          { $match: { ownerId: user._id } },
          { $group: { _id: null, total: { $sum: '$downloadCount' } } },
        ]);

        return {
          ...user.toObject(),
          fileCount,
          totalDownloads: downloadCount.length > 0 ? downloadCount[0].total : 0,
          storagePercentage: user.getStoragePercentage().toFixed(2),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

export const clearAnalyticsCache = (req, res) => {
  analyticsCache = null;
  analyticsCacheTime = null;

  res.status(200).json({
    success: true,
    message: 'Analytics cache cleared',
  });
};
