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
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

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

// Generate a signed URL for temporary access (for downloading/viewing)
export const getSignedUrl = async (fileName: string, expiresIn = 60): Promise<string> => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Expires: expiresIn
  };

  return s3.getSignedUrlPromise('getObject', params);
};

// Generate a pre-signed URL for uploading a file directly to S3
export const getUploadSignedUrl = async (contentType: string, expiresIn = 60): Promise<{url: string, fileName: string}> => {
  const fileName = generateFileName();
  
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Expires: expiresIn,
    ContentType: contentType,
    ACL: 'public-read',
    Conditions: [
      ['content-length-range', 0, MAX_FILE_SIZE] // Restrict file size to 10MB
    ]
  };

  const url = await s3.getSignedUrlPromise('putObject', params);
  return { url, fileName };
};

// Get the public URL for a file in S3
export const getPublicUrl = (fileName: string): string => {
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
};
