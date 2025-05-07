import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getUploadUrl } from '../controllers/upload.controller';

const router: express.Router = express.Router();

// Route to get a pre-signed URL for direct uploads
router.post('/presigned', authenticate as RequestHandler, getUploadUrl);

export default router;
