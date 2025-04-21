import { Request, Response } from 'express';
import { prismaClient } from '@repo/db/client';

// Follow a user
export const followUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const followerId = req.user;

    // Cannot follow yourself
    if (username === followerId) {
      res.status(400).json({ error: 'Cannot follow yourself' });
      return;
    }

    // Check if user to follow exists
    const userToFollow = await prismaClient.user.findUnique({
      where: { username },
    });

    if (!userToFollow) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if already following
    const existingFollow = await prismaClient.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: username,
        },
      },
    });

    if (existingFollow) {
      res.status(400).json({ error: 'Already following this user' });
      return;
    }

    // Create follow relationship
    await prismaClient.follow.create({
      data: {
        followerId,
        followingId: username,
      },
    });

     res.status(201).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Unfollow a user
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const followerId = req.user;

    // Check if follow relationship exists
    const existingFollow = await prismaClient.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: username,
        },
      },
    });

    if (!existingFollow) {
      res.status(404).json({ error: 'Not following this user' });
      return;
    }

    // Delete follow relationship
    await prismaClient.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: username,
        },
      },
    });

     res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Check if user is following another user
export const checkFollow = async (req: Request, res: Response) : Promise<void> => {
  try {
    const { username } = req.params;
    const followerId = req.user;

    // Check if follow relationship exists
    const existingFollow = await prismaClient.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: username,
        },
      },
    });

    res.status(200).json({ following: !!existingFollow });
  } catch (error) {
    console.error('Check follow error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Get followers of a user
export const getUserFollowers = async (req: Request, res: Response): Promise<void> => {
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

    // Get followers
    const followers = await prismaClient.follow.findMany({
      where: { followingId: username },
      skip,
      take: limit,
      include: {
        follower: {
          select: {
            username: true,
            name: true,
            image: true,
            createdAt: true,
          },
        },
      },
    });

    // Transform the response to return just the users
    const users = followers.map((follow) => follow.follower);

    // Get total count for pagination
    const totalFollowers = await prismaClient.follow.count({
      where: { followingId: username },
    });

     res.status(200).json({
      users,
      pagination: {
        total: totalFollowers,
        page,
        limit,
        pages: Math.ceil(totalFollowers / limit),
      },
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Get users that a user is following
export const getUserFollowing = async (req: Request, res: Response): Promise<void> => {
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

    // Get following
    const following = await prismaClient.follow.findMany({
      where: { followerId: username },
      skip,
      take: limit,
      include: {
        following: {
          select: {
            username: true,
            name: true,
            image: true,
            createdAt: true,
          },
        },
      },
    });

    // Transform the response to return just the users
    const users = following.map((follow) => follow.following);

    // Get total count for pagination
    const totalFollowing = await prismaClient.follow.count({
      where: { followerId: username },
    });

    res.status(200).json({
      users,
      pagination: {
        total: totalFollowing,
        page,
        limit,
        pages: Math.ceil(totalFollowing / limit),
      },
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};
