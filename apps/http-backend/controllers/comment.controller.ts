import { Request, Response } from 'express';
import { prismaClient } from '@repo/db/client';
import { z } from 'zod';

// Validation schemas
const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(500),
});

// Create a comment on a photo
export const createComment = async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    const userId = req.user;

    // Validate request body
    const validation = createCommentSchema.safeParse(req.body);
    if (!validation.success) {
       res.status(400).json({ error: validation.error.errors });
       return;
    }

    // Check if photo exists
    const photo = await prismaClient.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
       res.status(404).json({ error: 'Photo not found' });
       return;
    }

    // Create comment
    const comment = await prismaClient.comment.create({
      data: {
        content: validation.data.content,
        userId,
        photoId,
      },
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

     res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
     res.status(500).json({ error: 'Internal server error' });
  }
};

// Get comments for a photo
export const getPhotoComments = async (req: Request, res: Response) => {
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

    // Get comments with user info
    const comments = await prismaClient.comment.findMany({
      where: { photoId },
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
      },
    });

    // Get total count for pagination
    const totalComments = await prismaClient.comment.count({
      where: { photoId },
    });

     res.status(200).json({
      comments,
      pagination: {
        total: totalComments,
        page,
        limit,
        pages: Math.ceil(totalComments / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
     res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user;

    // Validate request body
    const validation = updateCommentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.errors });
      return;
    }

    // Check if comment exists and belongs to the user
    const existingComment = await prismaClient.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
       res.status(404).json({ error: 'Comment not found' });
       return;
    }

    if (existingComment.userId !== userId) {
       res.status(403).json({ error: 'Not authorized to update this comment' });
       return;
    }

    // Update comment
    const comment = await prismaClient.comment.update({
      where: { id: commentId },
      data: {
        content: validation.data.content,
        updatedAt: new Date(),
      },
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

     res.status(200).json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
     res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user;

    // Check if comment exists and belongs to the user
    const existingComment = await prismaClient.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Allow comment deletion by the comment author or the photo owner
    const photo = await prismaClient.photo.findUnique({
      where: { id: existingComment.photoId },
    });

    if (existingComment.userId !== userId && photo?.userId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this comment' });
      return;
    }

    // Delete comment
    await prismaClient.comment.delete({
      where: { id: commentId },
    });

     res.status(204).send();
  } catch (error) {
    console.error('Delete comment error:', error);
     res.status(500).json({ error: 'Internal server error' });
  }
};
