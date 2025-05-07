import { Request, Response } from 'express';
import { getUploadSignedUrl, getPublicUrl } from '../util/s3';
import { z } from 'zod';
import { handleError } from '../util/controller.utils';

// Validation schema for upload request
const uploadRequestSchema = z.object({
  contentType: z.string().min(1),
  expiresIn: z.number().optional()
});

// Generate a pre-signed URL for direct upload to S3
export const getUploadUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validation = uploadRequestSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.errors });
      return;
    }

    const { contentType, expiresIn = 60 } = validation.data;

    // Generate a pre-signed URL for uploading
    const { url, fileName } = await getUploadSignedUrl(contentType, expiresIn);

    // Return the URL, filename, and the public URL that will be accessible after upload
    res.status(200).json({
      uploadUrl: url,
      fileName,
      publicUrl: getPublicUrl(fileName),
      expiresIn
    });
  } catch (error) {
    handleError(res, error, 'Generate upload URL error');
    return;
  }
};
