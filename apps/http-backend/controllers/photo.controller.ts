import { Request, Response } from 'express';
import { prismaClient } from '@repo/db/client';
import { uploadFile, deleteFile } from '../util/s3';
import { z } from 'zod';

// Validation schemas
const createPhotoSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  tags: z.array(z.string()),
  imageUrl: z.string().url().optional(),
});

const updatePhotoSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  tags: z.array(z.string()).optional(),
});

// Create a new photo
export const createPhoto = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = createPhotoSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.errors });
      return;
    }

    // Parse tags from JSON string if needed
    let tags = validation.data.tags;
    if (typeof req.body.tags === 'string') {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (error) {
        res.status(400).json({ error: 'Invalid tags format' });
        return;
      }
    }

    // Check for the URL of the uploaded image
    if (!req.body.imageUrl) {
      res.status(400).json({ error: 'No image URL provided' });
      return;
    }

    if(!req.user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }
    
    // Create photo record in database
    const photo = await prismaClient.photo.create({
      data: {
        url: req.body.imageUrl,
        title: validation.data.title,
        description: validation.data.description,
        tags,
        userId: req.user,
      },
    });

     res.status(201).json(photo);
  } catch (error) {
    console.error('Create photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Get all photos (with pagination)
export const getAllPhotos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get photos with user info and counts
    const photos = await prismaClient.photo.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
    });

    // Get total count for pagination
    const totalPhotos = await prismaClient.photo.count();

     res.status(200).json({
      photos,
      pagination: {
        total: totalPhotos,
        page,
        limit,
        pages: Math.ceil(totalPhotos / limit),
      },
    });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Get photos by tag
export const getPhotosByTag = async (req: Request, res: Response) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get photos with the specified tag
    const photos = await prismaClient.photo.findMany({
      where: {
        tags: {
          has: tag,
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
    });

    // Get total count for pagination
    const totalPhotos = await prismaClient.photo.count({
      where: {
        tags: {
          has: tag,
        },
      },
    });

    res.status(200).json({
      photos,
      pagination: {
        total: totalPhotos,
        page,
        limit,
        pages: Math.ceil(totalPhotos / limit),
      },
    });
  } catch (error) {
    console.error('Get photos by tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Get a specific photo by ID
export const getPhotoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get photo with user info and counts
    const photo = await prismaClient.photo.findUnique({
      where: { id },
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
    });

    if (!photo) {
       res.status(404).json({ error: 'Photo not found' });
       return;
    }

   res.status(200).json(photo);
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Update a photo
export const updatePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validation = updatePhotoSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.errors });
      return;
    }

    // Check if photo exists and belongs to the user
    const existingPhoto = await prismaClient.photo.findUnique({
      where: { id },
    });

    if (!existingPhoto) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    if (existingPhoto.userId !== req.user) {
      res.status(403).json({ error: 'Not authorized to update this photo' });
      return;
    }

    // Update photo
    const photo = await prismaClient.photo.update({
      where: { id },
      data: validation.data,
    });

     res.status(200).json(photo);
  } catch (error) {
    console.error('Update photo error:', error);
     res.status(500).json({ error: 'Internal server error' });
     return;
  }
};

// Delete a photo
export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if photo exists and belongs to the user
    const existingPhoto = await prismaClient.photo.findUnique({
      where: { id },
    });

    if (!existingPhoto) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    if (existingPhoto.userId !== req.user) {
      res.status(403).json({ error: 'Not authorized to delete this photo' });
      return;
    }

    // Delete photo from S3
    await deleteFile(existingPhoto.url);

    // Delete photo from database (cascade will delete related likes, comments, saves)
    await prismaClient.photo.delete({
      where: { id },
    });

     res.status(204).send();
  } catch (error) {
    console.error('Delete photo error:', error);
     res.status(500).json({ error: 'Internal server error' });
     return;
  }
};

// Get photos by user
export const getPhotosByUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await prismaClient.user.findUnique({
      where: { username },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get photos by user
    const photos = await prismaClient.photo.findMany({
      where: { userId: username },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
            saves: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalPhotos = await prismaClient.photo.count({
      where: { userId: username },
    });

     res.status(200).json({
      photos,
      pagination: {
        total: totalPhotos,
        page,
        limit,
        pages: Math.ceil(totalPhotos / limit),
      },
    });
  } catch (error) {
    console.error('Get user photos error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};
