import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createComment,
  getPhotoComments,
  updateComment,
  deleteComment
} from '../controllers/comment.controller';

const router: express.Router = express.Router();

// Routes
router.post('/:photoId', authenticate as RequestHandler, createComment);
router.get('/:photoId', getPhotoComments as RequestHandler);
router.put('/:commentId', authenticate as RequestHandler, updateComment);
router.delete('/:commentId', authenticate as RequestHandler, deleteComment);

export default router;
