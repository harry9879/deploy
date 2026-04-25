import User from '../models/User.js';
import File from '../models/File.js';

export const checkUserStorage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    const maxUserStorage = parseInt(process.env.MAX_USER_STORAGE) || 524288000;
    const newTotalStorage = user.storageUsed + totalSize;

    if (newTotalStorage > maxUserStorage) {
      const availableStorage = maxUserStorage - user.storageUsed;
      const availableMB = (availableStorage / (1024 * 1024)).toFixed(2);
      const requiredMB = (totalSize / (1024 * 1024)).toFixed(2);

      return res.status(413).json({
        success: false,
        message: `Storage limit exceeded. You have ${availableMB}MB available but need ${requiredMB}MB.`,
        storageUsed: user.storageUsed,
        maxStorage: maxUserStorage,
        availableStorage,
        requiredSize: totalSize,
      });
    }

    const storagePercentage = (newTotalStorage / maxUserStorage) * 100;
    
    if (storagePercentage >= 80) {
      req.storageWarning = {
        percentage: storagePercentage.toFixed(2),
        message: `You are using ${storagePercentage.toFixed(2)}% of your storage quota.`,
      };
    }

    next();
  } catch (error) {
    console.error('Storage check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking storage limits',
      error: error.message,
    });
  }
};

export const checkGlobalStorage = async (req, res, next) => {
  try {
    const result = await File.aggregate([
      { $match: { isExpired: false } },
      { $group: { _id: null, totalSize: { $sum: '$size' } } },
    ]);

    const totalGlobalStorage = result.length > 0 ? result[0].totalSize : 0;
    const maxGlobalStorage = parseInt(process.env.MAX_GLOBAL_STORAGE) || 10737418240;
    const globalPercentage = (totalGlobalStorage / maxGlobalStorage) * 100;

    if (globalPercentage >= 90) {
      req.globalStorageWarning = {
        percentage: globalPercentage.toFixed(2),
        totalUsed: totalGlobalStorage,
        maxStorage: maxGlobalStorage,
        message: `⚠️ Global storage at ${globalPercentage.toFixed(2)}% capacity!`,
      };
      
      console.warn(`⚠️ GLOBAL STORAGE WARNING: ${globalPercentage.toFixed(2)}% used`);
    }

    next();
  } catch (error) {
    console.error('Global storage check error:', error);
    next();
  }
};
