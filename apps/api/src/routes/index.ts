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

const router = Router();

// Auth
router.use('/auth', authRouter);

// News
router.use('/news', newsRouter);

// Comments + approval queues
router.use('/comments', commentsRouter);

// Presentations
router.use('/presentations', presentationsRouter);

// Videos
router.use('/videos', videosRouter);

// Bunny Stream webhook
router.use('/webhooks/bunny-stream', bunnyWebhookRouter);

// Placeholder — additional routers mounted as phases are built
// router.use('/knowledge', knowledgeRouter);
// router.use('/foreign-policy', foreignPolicyRouter);
// router.use('/research', researchRouter);
// router.use('/users', usersRouter);
// router.use('/admin', adminRouter);

export { router as apiRouter };
