import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prismaClient } from '@repo/db/client';


// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: string;
    }
  }
}
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
       res.status(401).json({ error: 'Invalid token' });
       return;
    }
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };


    if(!decoded.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    // Find user
    const user = await prismaClient.user.findUnique({
      where: { username: decoded.userId },
      select: {
        username: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user to request object
    req.user = user.username;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
