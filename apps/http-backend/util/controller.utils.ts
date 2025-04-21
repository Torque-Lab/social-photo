import { Response } from 'express';
import bcrypt from 'bcrypt';

/**
 * Common utility functions for controllers
 */

// Standard error response handler
export const handleError = (res: Response, error: any, message: string = 'Internal server error') => {
  console.error(`Error: ${message}`, error);
  return res.status(500).json({ error: message });
};

// Hash password utility
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

// Standard user select fields (excluding sensitive data)
export const userSelectFields = {
  username: true,
  name: true,
  image: true,
  createdAt: true,
};

// Pagination utility
export const getPaginationParams = (query: any) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

// Format pagination response
export const formatPaginationResponse = (data: any[], total: number, page: number, limit: number) => {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};
