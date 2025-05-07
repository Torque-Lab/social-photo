import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getCurrentUser,
  getUserByUsername,
  updateUser,
  updateUserImage,
  getUserSavedPhotos
} from '../controllers/user.controller';

const router: express.Router = express.Router();

// Routes
router.get('/me', authenticate as RequestHandler, getCurrentUser);
router.get('/me/saved', authenticate as RequestHandler, getUserSavedPhotos);
router.put('/me', authenticate as RequestHandler, updateUser);
router.put('/me/image', authenticate as RequestHandler, updateUserImage);
router.get('/:username', getUserByUsername);

export default router;
