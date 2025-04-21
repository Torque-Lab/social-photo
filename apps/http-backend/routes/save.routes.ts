import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  savePhoto,
  unsavePhoto,
  checkSave
} from '../controllers/save.controller';

const router: express.Router = express.Router();

// Routes
router.post('/:photoId', authenticate as RequestHandler, savePhoto);
router.delete('/:photoId', authenticate as RequestHandler, unsavePhoto);
router.get('/:photoId/check', authenticate as RequestHandler, checkSave);

export default router;
