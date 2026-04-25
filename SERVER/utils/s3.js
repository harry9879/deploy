import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';

let s3Client = null;

export const initS3Client = () => {
  if (!s3Client && process.env.AWS_ACCESS_KEY_ID) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.TIGRIS_ENDPOINT || 'https://fly.storage.tigris.dev',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};

export const uploadFileToS3 = async (filePath, key, contentType) => {
  const client = initS3Client();
  if (!client) throw new Error('S3 Client not initialized. Check Tigris credentials.');
  
  const fileStream = fs.createReadStream(filePath);
  
  const command = new PutObjectCommand({
    Bucket: process.env.TIGRIS_BUCKET,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
  });

  await client.send(command);
  return key;
};

export const getDownloadUrl = async (key, expiresIn = 3600) => {
  const client = initS3Client();
  if (!client) throw new Error('S3 Client not initialized.');
  
  const command = new GetObjectCommand({
    Bucket: process.env.TIGRIS_BUCKET,
    Key: key,
  });

  return await getSignedUrl(client, command, { expiresIn });
};

export const deleteFileFromS3 = async (key) => {
  const client = initS3Client();
  if (!client) throw new Error('S3 Client not initialized.');

  const command = new DeleteObjectCommand({
    Bucket: process.env.TIGRIS_BUCKET,
    Key: key,
  });

  await client.send(command);
};

export const getFileStreamFromS3 = async (key, range) => {
  const client = initS3Client();
  if (!client) throw new Error('S3 Client not initialized.');

  const command = new GetObjectCommand({
    Bucket: process.env.TIGRIS_BUCKET,
    Key: key,
    Range: range,
  });
  
  const response = await client.send(command);
  return {
    stream: response.Body,
    contentLength: response.ContentLength,
    contentRange: response.ContentRange,
    contentType: response.ContentType,
    acceptRanges: response.AcceptRanges,
  };
};

export default {
  initS3Client,
  uploadFileToS3,
  getDownloadUrl,
  deleteFileFromS3,
  getFileStreamFromS3,
};
