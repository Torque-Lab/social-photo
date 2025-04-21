import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { signUp, signIn, resetPassword, forgotPassword } from '../controllers/auth.controller';


const router: express.Router = express.Router();        

// Routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
