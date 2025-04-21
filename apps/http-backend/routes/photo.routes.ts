import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import multer from 'multer';
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

// Configure multer for memory storage (needed for S3 uploads)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Routes
router.post('/', authenticate as RequestHandler, upload.single('photo'), createPhoto);
router.get('/', getAllPhotos);
router.get('/tag/:tag', getPhotosByTag);
router.get('/user/:username', getPhotosByUser);
router.get('/:id', getPhotoById);
router.put('/:id', authenticate as RequestHandler, updatePhoto);
router.delete('/:id', authenticate  as RequestHandler, deletePhoto);

export default router;
