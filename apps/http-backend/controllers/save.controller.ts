import { Request, Response } from 'express';
import { prismaClient } from '@repo/db/client';

// Save a photo
export const savePhoto = async (req: Request, res: Response): Promise<void> => {
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

    // Check if already saved
    const existingSave = await prismaClient.save.findUnique({
      where: {
        userId_photoId: {
          userId,
          photoId,
        },
      },
    });

    if (existingSave) {
      res.status(400).json({ error: 'Photo already saved' });
      return;
    }

    // Create save
    await prismaClient.save.create({
      data: {
        userId,
        photoId,
      },
    });

     res.status(201).json({ message: 'Photo saved successfully' });
  } catch (error) {
    console.error('Save photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Unsave a photo
export const unsavePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    const userId = req.user;

    if(!photoId || !userId) {
      res.status(400).json({ error: 'Invalid data' });
      return;
    }

      // Check if save exists
    const existingSave = await prismaClient.save.findUnique({
      where: {
        userId_photoId: {
          userId,
          photoId,
        },
      },
    });

    if (!existingSave) {
      res.status(404).json({ error: 'Save not found' });
      return;
    }

    // Delete save
    await prismaClient.save.delete({
      where: {
        userId_photoId: {
          userId,
          photoId,
        },
      },
    });

    res.status(200).json({ message: 'Photo unsaved successfully' });
  } catch (error) {
    console.error('Unsave photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Check if user has saved a photo
export const checkSave = async (req: Request, res: Response): Promise<void>  => {
  try {
    const { photoId } = req.params;
    const userId = req.user;

    if(!photoId || !userId) {
      res.status(400).json({ error: 'Invalid data' });
      return;
    }

    // Check if save exists
    const existingSave = await prismaClient.save.findUnique({
      where: {
        userId_photoId: {
          userId,
          photoId,
        },
      },
    });

    res.status(200).json({ saved: !!existingSave });
  } catch (error) {
    console.error('Check save error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};
