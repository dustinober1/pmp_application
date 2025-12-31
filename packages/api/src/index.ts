import dotenv from 'dotenv';

// Load environment variables before anything else
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { env } from './config/env';

// Import routes
import healthRouter from './routes/health.routes';
import authRouter from './routes/auth.routes';
import subscriptionRouter from './routes/subscription.routes';
import domainRouter from './routes/domain.routes';
import flashcardRouter from './routes/flashcard.routes';
import practiceRouter from './routes/practice.routes';
import formulaRouter from './routes/formula.routes';
import dashboardRouter from './routes/dashboard.routes';
import teamRouter from './routes/team.routes';
import searchRouter from './routes/search.routes';


const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later',
    },
  },
});
app.use('/api', limiter);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request ID and logging
app.use(requestIdMiddleware);
app.use(
  morgan(':method :url :status :response-time ms - :req[x-request-id]', {
    stream: {
      write: (message: string) => {
        // eslint-disable-next-line no-console
        console.log(message.trim());
      },
    },
  })
);

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/domains', domainRouter);
app.use('/api/flashcards', flashcardRouter);
app.use('/api/practice', practiceRouter);
app.use('/api/formulas', formulaRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/teams', teamRouter);
app.use('/api/search', searchRouter);


// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = env.PORT;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 PMP Study API running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`📚 Environment: ${env.NODE_ENV}`);
});

export default app;
