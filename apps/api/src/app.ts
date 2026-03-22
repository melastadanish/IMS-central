// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Express Application
// ─────────────────────────────────────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { applySecurityMiddleware } from './middleware/security.js';
import { apiRouter } from './routes/index.js';
import { logger } from './lib/logger.js';

export function createApp() {
  const app = express();

  // ── Security headers + rate limiting ────────────────────────────────────────
  applySecurityMiddleware(app);

  // ── CORS ────────────────────────────────────────────────────────────────────
  const allowedOrigins = (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, Postman, Bruno)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn({ origin }, 'Blocked by CORS');
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true, // Required for cookies
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // ── Body parsing ─────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // ── Health check ─────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API routes ────────────────────────────────────────────────────────────────
  app.use('/api/v1', apiRouter);

  // ── 404 handler ───────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found', code: 'NOT_FOUND' });
  });

  // ── Global error handler ──────────────────────────────────────────────────────
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  });

  return app;
}
