import { Request, Response } from 'express';
import { prismaClient } from '@repo/db/client';
import { uploadFile, deleteFile } from '../util/s3';
import { z } from 'zod';
import { handleError, hashPassword, userSelectFields, getPaginationParams, formatPaginationResponse } from '../util/controller.utils';
const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  password: z.string().min(8).optional(),
});
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is already attached to req by the authenticate middleware
    res.status(200).json(req.user);
  } catch (error) {
    handleError(res, error, 'Get profile error');
    return;
  }
};

// Get user by username
export const getUserByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await prismaClient.user.findUnique({
      where: { username },
      select: {
        ...userSelectFields,
        _count: {
          select: {
            photos: true,
            followers: true,
            follows: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    handleError(res, error, 'Get user error');
    return;
  }
};

// Update user profile
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validation = updateUserSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.errors });
      return;
    }

    const updateData: any = {};

    // Only update the fields that were provided
    if (validation.data.name) {
      updateData.name = validation.data.name;
    }

    if (validation.data.password) {
      updateData.password = await hashPassword(validation.data.password);
    }

    // Update user
    const updatedUser = await prismaClient.user.update({
      where: { username: req.user},
      data: updateData,
      select: userSelectFields,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    handleError(res, error, 'Update user error');
    return;
  }
};

// Update user profile image
export const updateUserImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image uploaded' });
      return;
    }

    // Get current user to check if they have an existing image
    const currentUser = await prismaClient.user.findUnique({
      where: { username: req.user},
      select: { image: true },
    });

    // Delete old image from S3 if it exists
    if (currentUser?.image) {
      // Extract the filename from the URL
      const imageUrl = currentUser.image;
      const fileName = imageUrl.split('/').pop() || '';
      await deleteFile(fileName);
    }

    // Upload new image to S3
    const fileName = await uploadFile(req.file);
    
    // Construct the full URL for storage in the database
    const bucketName = process.env.AWS_BUCKET_NAME || '';
    const region = process.env.AWS_REGION || 'us-east-1';
    const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;

    // Update user with new image URL
    const updatedUser = await prismaClient.user.update({
      where: { username: req.user },
      data: { image: imageUrl },
      select: userSelectFields,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    handleError(res, error, 'Update profile image error');
    return;
  }
};

// Get user's saved photos
export const getUserSavedPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    // Get saved photos
    const savedPhotos = await prismaClient.save.findMany({
      where: { userId: req.user },
      skip,
      take: limit,
      include: {
        photo: {
          include: {
            user: {
              select: {
                username: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                saves: true,
              },
            },
          },
        },
      },
      orderBy: {
        photo: {
          createdAt: 'desc',
        },
      },
    });

    // Transform the response to return just the photos with save info
    const photos = savedPhotos.map((save) => save.photo);

    // Get total count for pagination
    const totalSaved = await prismaClient.save.count({
      where: { userId: req.user },
    });

    res.status(200).json(formatPaginationResponse(photos, totalSaved, page, limit));
  } catch (error) {
    handleError(res, error, 'Get saved photos error');
    return;
  }
};
