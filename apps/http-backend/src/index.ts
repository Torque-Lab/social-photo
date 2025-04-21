import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prismaClient } from '@repo/db/client';
import authRoutes from "../routes/auth.routes"
import userRoutes from '../routes/user.routes';
import photoRoutes from '../routes/photo.routes';
import likeRoutes from '../routes/like.routes';
import commentRoutes from '../routes/comment.routes';
import saveRoutes from '../routes/save.routes';
import followRoutes from '../routes/follow.routes';

// Initialize environment variables
dotenv.config(); 

// Create Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/saves', saveRoutes);
app.use('/api/follows', followRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


