import { Request, Response } from 'express';
import { prismaClient } from '@repo/db/client';

// Like a photo
export const likePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    const userId = req.user;

    // Check if photo exists
    const photo = await prismaClient.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }
    if(!photoId || !userId) {
      res.status(400).json({ error: 'Invalid data' });
      return;
    }

    // Check if already liked
    const existingLike = await prismaClient.like.findUnique({
      where: {
        userId_photoId: {
          userId,
          photoId,
        },
      },
    });

    if (existingLike) {
      res.status(400).json({ error: 'Photo already liked' });
      return;
    }

    // Create like
    await prismaClient.like.create({
      data: {
        userId,
        photoId,
      },
    });

    res.status(201).json({ message: 'Photo liked successfully' });
  } catch (error) {
    console.error('Like photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Unlike a photo
export const unlikePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    const userId = req.user;
    if(!photoId || !userId) {
      res.status(400).json({ error: 'Invalid data' });
      return;
    }
    // Check if like exists
    const existingLike = await prismaClient.like.findUnique({
      where: {
        userId_photoId: {
          userId,
          photoId,
        },
      },
    });

    if (!existingLike) {
      res.status(404).json({ error: 'Like not found' });
      return;
    }

    // Delete like
    await prismaClient.like.delete({
      where: {
        userId_photoId: {
          userId,
          photoId,
        },
      },
    });

    res.status(200).json({ message: 'Photo unliked successfully' });
  } catch (error) {
    console.error('Unlike photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Check if user has liked a photo
export const checkLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    const userId = req.user;
    if(!photoId || !userId) {
      res.status(400).json({ error: 'Invalid data' });
      return;
    }
    // Check if like exists
    const existingLike = await prismaClient.like.findUnique({
      where: {
        userId_photoId: {
          userId,
          photoId,
        },
      },
    });

    res.status(200).json({ liked: !!existingLike });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Get users who liked a photo
export const getLikedUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Check if photo exists
    const photo = await prismaClient.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    // Get likes with user info
    const likes = await prismaClient.like.findMany({
      where: { photoId },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Transform the response to return just the users
    const users = likes.map((like) => like.user);

    // Get total count for pagination
    const totalLikes = await prismaClient.like.count({
      where: { photoId },
    });

    res.status(200).json({
      users,
      pagination: {
        total: totalLikes,
        page,
        limit,
        pages: Math.ceil(totalLikes / limit),
      },
    });
  } catch (error) {
    console.error('Get like users error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};
