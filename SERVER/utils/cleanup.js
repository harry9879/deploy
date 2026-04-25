import cron from 'node-cron';
import File from '../models/File.js';
import User from '../models/User.js';
import { deleteDirectory } from '../utils/fileHelper.js';
import { deleteFileFromS3 } from '../utils/s3.js';
import path from 'path';

/**
 * Cleanup expired files
 * Runs daily at 2 AM (or as configured in CLEANUP_CRON_SCHEDULE)
 */
export const startCleanupJob = () => {
  const schedule = process.env.CLEANUP_CRON_SCHEDULE || '0 2 * * *';

  console.log(`🧹 Cleanup job scheduled: ${schedule}`);

  cron.schedule(schedule, async () => {
    console.log('🧹 Running cleanup job...');
    
    try {
      const now = new Date();
      
      // Find expired files
      const expiredFiles = await File.find({
        $or: [
          { expiryTime: { $lt: now } },
          {
            $and: [
              { maxDownloads: { $ne: null } },
              { $expr: { $gte: ['$downloadCount', '$maxDownloads'] } },
            ],
          },
        ],
        isExpired: false,
      });

      console.log(`📦 Found ${expiredFiles.length} expired files`);

      let deletedCount = 0;
      let failedCount = 0;
      let freedSpace = 0;

      for (const file of expiredFiles) {
        try {
          // Delete file from disk or S3
          if (file.storedPath.startsWith('s3://')) {
            const s3Key = file.storedPath.replace('s3://', '');
            await deleteFileFromS3(s3Key);
          } else {
            const fileDir = path.dirname(file.storedPath);
            await deleteDirectory(fileDir);
          }

          // Update user storage
          await User.findByIdAndUpdate(file.ownerId, {
            $inc: { storageUsed: -file.size },
          });

          freedSpace += file.size;

          // Mark as expired or delete
          await File.findByIdAndDelete(file._id);
          
          deletedCount++;
        } catch (error) {
          console.error(`❌ Error deleting file ${file.uuid}:`, error.message);
          failedCount++;
          
          // Mark as expired even if deletion failed
          file.isExpired = true;
          await file.save();
        }
      }

      const freedMB = (freedSpace / (1024 * 1024)).toFixed(2);

      console.log(`✅ Cleanup completed:`);
      console.log(`   - Deleted: ${deletedCount} files`);
      console.log(`   - Failed: ${failedCount} files`);
      console.log(`   - Freed: ${freedMB} MB`);

      // Check global storage and log warning if needed
      const result = await File.aggregate([
        { $match: { isExpired: false } },
        { $group: { _id: null, totalSize: { $sum: '$size' } } },
      ]);

      const totalGlobalStorage = result.length > 0 ? result[0].totalSize : 0;
      const maxGlobalStorage = parseInt(process.env.MAX_GLOBAL_STORAGE) || 10737418240;
      const globalPercentage = (totalGlobalStorage / maxGlobalStorage) * 100;

      if (globalPercentage >= 90) {
        console.warn(`⚠️  GLOBAL STORAGE WARNING: ${globalPercentage.toFixed(2)}% used`);
      }

    } catch (error) {
      console.error('❌ Cleanup job error:', error);
    }
  });
};

/**
 * Manual cleanup trigger (for testing or admin use)
 */
export const runCleanupNow = async () => {
  console.log('🧹 Running manual cleanup...');
  
  try {
    const now = new Date();
    
    const expiredFiles = await File.find({
      $or: [
        { expiryTime: { $lt: now } },
        {
          $and: [
            { maxDownloads: { $ne: null } },
            { $expr: { $gte: ['$downloadCount', '$maxDownloads'] } },
          ],
        },
      ],
      isExpired: false,
    });

    console.log(`📦 Found ${expiredFiles.length} expired files`);

    let deletedCount = 0;
    let failedCount = 0;

    for (const file of expiredFiles) {
      try {
        if (file.storedPath.startsWith('s3://')) {
          const s3Key = file.storedPath.replace('s3://', '');
          await deleteFileFromS3(s3Key);
        } else {
          const fileDir = path.dirname(file.storedPath);
          await deleteDirectory(fileDir);
        }

        await User.findByIdAndUpdate(file.ownerId, {
          $inc: { storageUsed: -file.size },
        });

        await File.findByIdAndDelete(file._id);
        
        deletedCount++;
      } catch (error) {
        console.error(`❌ Error deleting file ${file.uuid}:`, error.message);
        failedCount++;
        
        file.isExpired = true;
        await file.save();
      }
    }

    return {
      success: true,
      deleted: deletedCount,
      failed: failedCount,
    };
  } catch (error) {
    console.error('❌ Manual cleanup error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  startCleanupJob,
  runCleanupNow,
};
