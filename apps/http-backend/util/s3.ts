import {S3} from 'aws-sdk';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { Express } from 'express';

dotenv.config();

// Initialize S3 client
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const bucketName = process.env.AWS_BUCKET_NAME || '';

// Generate a random file name to avoid collisions
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// Upload file to S3
export const uploadFile = async (file: Express.Multer.File): Promise<string> => {
  const fileName = generateFileName();
  
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  await s3.upload(params).promise();
  return fileName;
};

// Delete file from S3
export const deleteFile = async (fileName: string): Promise<void> => {
  const params = {
    Bucket: bucketName,
    Key: fileName
  };

  await s3.deleteObject(params).promise();
};

// Get file from S3
export const getFileStream = (fileName: string) => {
  const params = {
    Bucket: bucketName,
    Key: fileName
  };

  return s3.getObject(params).createReadStream();
};

// Generate a signed URL for temporary access
export const getSignedUrl = async (fileName: string, expiresIn = 60): Promise<string> => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Expires: expiresIn
  };

  return s3.getSignedUrlPromise('getObject', params);
};
