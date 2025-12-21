import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import questionRoutes from './routes/questions';
import flashcardRoutes from './routes/flashcards';
import practiceRoutes from './routes/practice';
import authRoutes from './routes/auth';
import progressRoutes from './routes/progress';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/questions', questionRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

app.use('/api/admin', (req, res) => {
  // Placeholder for admin routes
  res.json({ message: 'Admin routes coming soon' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
});

export default app;