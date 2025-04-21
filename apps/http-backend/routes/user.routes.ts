import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import multer from 'multer';
import {
  getCurrentUser,
  getUserByUsername,
  updateUser,
  updateUserImage,
  getUserSavedPhotos
} from '../controllers/user.controller';

const router: express.Router = express.Router();

// Configure multer for memory storage (needed for S3 uploads)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile images
  },
});

// Routes
router.get('/me', authenticate as RequestHandler, getCurrentUser);
router.get('/me/saved', authenticate as RequestHandler, getUserSavedPhotos);
router.put('/me', authenticate as RequestHandler, updateUser);
router.put('/me/image', authenticate as RequestHandler, upload.single('image'), updateUserImage);
router.get('/:username', getUserByUsername);

export default router;
