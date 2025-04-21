import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  followUser,
  unfollowUser,
  checkFollow,
  getUserFollowers,
  getUserFollowing
} from '../controllers/follow.controller';

const router: express.Router = express.Router();

// Routes
router.post('/:username', authenticate as RequestHandler, followUser );
router.delete('/:username', authenticate as RequestHandler, unfollowUser);
router.get('/:username/check', authenticate as RequestHandler, checkFollow);
router.get('/:username/followers',   getUserFollowers);
router.get('/:username/following', getUserFollowing);

export default router;
