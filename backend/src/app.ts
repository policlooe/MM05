import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { csrfTokenGenerator, csrfProtection } from './middleware/csrf.middleware.js';
import { validateEnv } from './utils/validateEnv.js';
import { initSentry, captureError } from './lib/sentry.js';
import { HealthController } from './controllers/health.controller.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

// Validate environment variables before starting
const env = validateEnv();

const app: Express = express();

// Sentry initialization
initSentry();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

app.use(cookieParser());

// Request logging (skip health checks to reduce noise)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    skip: (req: Request) => req.url.startsWith('/health'),
    stream: {
      write: (message: string) => console.log(message.trim()),
    },
  }));
}

// CRITICAL: Webhook route MUST use raw body BEFORE json parser
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

// JSON parser for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF token generator (must be after cookieParser and before routes)
app.use(csrfTokenGenerator);

// Rate limiting
app.use('/api', apiLimiter);

// CSRF token endpoint (must be before CSRF protection)
app.get('/api/csrf-token', (req: Request, res: Response) => {
  res.json({ 
    success: true,
    csrfToken: res.locals.csrfToken 
  });
});

// CSRF protection for state-changing operations
app.use('/api', csrfProtection);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);

// Health check endpoints
app.get('/health', HealthController.check);
app.get('/health/ready', HealthController.ready);
app.get('/health/live', HealthController.live);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use(errorHandler);

export default app;
