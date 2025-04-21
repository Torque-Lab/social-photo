import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  likePhoto,
  unlikePhoto,
  checkLike,
  getLikedUsers
} from '../controllers/like.controller';

const router: express.Router = express.Router();

// Routes
router.post('/:photoId', authenticate as RequestHandler, likePhoto);
router.delete('/:photoId', authenticate as RequestHandler, unlikePhoto);
router.get('/:photoId/check', authenticate as RequestHandler, checkLike);
router.get('/:photoId/users', authenticate as RequestHandler, getLikedUsers);

export default router;
