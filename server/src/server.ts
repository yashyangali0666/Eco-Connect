import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import requestRoutes from './routes/request.routes';
import staffRoutes from './routes/staff.routes';
import userRoutes from './routes/user.routes';
import dashboardRoutes from './routes/dashboard.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 8080;

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Leaflet tiles and OpenStreetMap tiles to load smoothly
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL || '',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed from this origin'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 500, // Reasonable limit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again in 15 minutes.',
  },
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for file uploads
const uploadDir = path.resolve(process.env.UPLOAD_DIR || (process.env.VERCEL ? '/tmp/uploads' : 'uploads'));
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('Notice: Upload directory could not be created directly (normal in serverless):', err);
}
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EcoCollect REST API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/waste-categories', categoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// In production, serve the built Vite React client static files
const possiblePaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
];
const clientDistPath = possiblePaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  console.log(`📦 Serving static frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized Error Handling
app.use(errorHandler);

// Start server if not running in Jest test runner or Vercel Serverless
if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined && !process.env.VERCEL) {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🌿 EcoCollect API server listening on 0.0.0.0:${PORT}`);
    console.log(`🚀 Mode: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
