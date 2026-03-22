// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Security Middleware
// Helmet headers + granular rate limiting per route type.
// ─────────────────────────────────────────────────────────────────────────────

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';

export function applySecurityMiddleware(app: Express): void {
  // ── Helmet security headers ────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: [
            // Bunny Stream player
            'https://iframe.mediadelivery.net',
            // External video fallbacks
            'https://www.youtube-nocookie.com',
            'https://player.vimeo.com',
            'https://www.dailymotion.com',
          ],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: {
        maxAge: 63_072_000, // 2 years
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // ── Rate Limiting ──────────────────────────────────────────────────────────

  // General API: 100 requests per minute per IP
  app.use(
    '/api/',
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: 'Too many requests, please slow down', code: 'RATE_LIMITED' },
    }),
  );

  // Auth routes: 10 per 15 minutes (brute force prevention)
  app.use(
    '/api/v1/auth/',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: { success: false, error: 'Too many authentication attempts', code: 'RATE_LIMITED' },
    }),
  );

  // Comment submission: 20 per hour
  app.use(
    '/api/v1/comments',
    rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 20,
      message: { success: false, error: 'Comment submission limit reached', code: 'RATE_LIMITED' },
    }),
  );

  // Expert application: 3 per 24 hours (prevent spam applications)
  app.use(
    '/api/v1/experts/apply',
    rateLimit({
      windowMs: 24 * 60 * 60 * 1000,
      max: 3,
      message: {
        success: false,
        error: 'Expert application limit reached for today',
        code: 'RATE_LIMITED',
      },
    }),
  );

  // Opinion point requests: 5 per hour (prevent abuse)
  app.use(
    '/api/v1/comments/:id/request-points',
    rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 5,
      message: {
        success: false,
        error: 'Opinion request limit reached',
        code: 'RATE_LIMITED',
      },
    }),
  );
}
