// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Root API Router
// Mounts all versioned route modules under /api/v1/
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { authRouter } from './auth/auth.router.js';
import { newsRouter } from './news/news.router.js';
import { commentsRouter } from './comments/comments.router.js';
import { presentationsRouter } from './presentations/presentations.router.js';
import { videosRouter, bunnyWebhookRouter } from './videos/videos.router.js';
import knowledgeRouter from './knowledge.js';
import foreignPolicyRouter from './foreign-policy.js';
import researchRouter from './research.js';

const router = Router();

// Auth
router.use('/auth', authRouter);

// News
router.use('/news', newsRouter);

// Comments + approval queues
router.use('/comments', commentsRouter);

// Presentations
router.use('/presentations', presentationsRouter);

// Videos (Bunny Stream)
router.use('/videos', videosRouter);

// Bunny Stream webhook
router.use('/webhooks/bunny-stream', bunnyWebhookRouter);

// Knowledge Library
router.use('/knowledge', knowledgeRouter);

// Foreign Policy Tracker
router.use('/foreign-policy', foreignPolicyRouter);

// Research Ecosystem
router.use('/research', researchRouter);

// Health check per-module (useful for debugging)
router.get('/status', (_req, res) => {
  res.json({
    success: true,
    data: {
      api: 'ok',
      routes: ['auth', 'news', 'comments', 'presentations', 'videos', 'knowledge', 'foreign-policy', 'research'],
      timestamp: new Date().toISOString(),
    },
  });
});

export { router as apiRouter };
