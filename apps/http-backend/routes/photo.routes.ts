import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createPhoto,
  getAllPhotos,
  getPhotosByTag,
  getPhotoById,
  updatePhoto,
  deletePhoto,
  getPhotosByUser
} from '../controllers/photo.controller';

const router: express.Router = express.Router();

// Routes
router.post('/', authenticate as RequestHandler, createPhoto);
router.get('/', getAllPhotos);
router.get('/tag/:tag', getPhotosByTag);
router.get('/user/:username', getPhotosByUser);
router.get('/:id', getPhotoById);
router.put('/:id', authenticate as RequestHandler, updatePhoto);
router.delete('/:id', authenticate  as RequestHandler, deletePhoto);

export default router;
