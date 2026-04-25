import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.TIGRIS_ENDPOINT || 'https://fly.storage.tigris.dev',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function test() {
  try {
    console.log("Testing Tigris S3 Connection...");
    const data = await s3Client.send(new ListBucketsCommand({}));
    const bucketNames = data.Buckets.map(b => b.Name);
    console.log("✅ Successfully connected to Tigris!");
    console.log("Available Buckets:", bucketNames.length > 0 ? bucketNames : "None");
    
    const targetBucket = process.env.TIGRIS_BUCKET;
    if (bucketNames.includes(targetBucket)) {
        console.log(`✅ Target bucket '${targetBucket}' exists!`);
        
        // Let's test write permissions
        console.log("Testing write permissions...");
        const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = await import('@aws-sdk/client-s3');
        const testKey = 'connection-test.txt';
        
        try {
            await s3Client.send(new PutObjectCommand({
                Bucket: targetBucket,
                Key: testKey,
                Body: 'Tigris is working perfectly!',
                ContentType: 'text/plain'
            }));
            console.log(`✅ Successfully wrote a test file to '${targetBucket}'!`);
        } catch(e) {
            console.log("❌ Write failed:", e.message);
        }
        
        try {
            await s3Client.send(new GetObjectCommand({
                Bucket: targetBucket,
                Key: testKey,
            }));
            console.log(`✅ Successfully read the test file!`);
        } catch(e) {
            console.log("❌ Read failed:", e.message);
        }
        
        try {
            await s3Client.send(new DeleteObjectCommand({
                Bucket: targetBucket,
                Key: testKey,
            }));
            console.log("✅ Successfully cleaned up the test file!");
        } catch(e) {
            console.log("❌ Delete failed:", e.message);
        }
        console.log("🚀 Storage connection test complete!");
    } else {
        console.log(`❌ Target bucket '${targetBucket}' was NOT found in your Tigris account!`);
        console.log(`⚠️ You need to either create a bucket named '${targetBucket}' in Tigris, or update TIGRIS_BUCKET in your .env to match one of the available buckets.`);
    }
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

test();
