// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — News Router
// GET  /api/v1/news/stories           Paginated feed (with filters)
// GET  /api/v1/news/stories/:slug     Single story with sources + summary
// GET  /api/v1/news/topics            All topics
// GET  /api/v1/news/trending          Top stories (last 24h by view count)
// GET  /api/v1/news/sources           All active sources
// POST /api/v1/news/stories/:slug/view  Increment view count
// PATCH /api/v1/news/stories/:id/publish  Editor: publish story
// PATCH /api/v1/news/stories/:id/topic    Editor: set topic
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { redis, CACHE_TTL, cacheGet, cacheSet } from '../../lib/redis.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { logger } from '../../lib/logger.js';

const router = Router();

// ── GET /topics ───────────────────────────────────────────────────────────────

router.get('/topics', async (_req: Request, res: Response): Promise<void> => {
  const cacheKey = 'news:topics:all';
  const cached = await cacheGet<unknown[]>(cacheKey);
  if (cached) {
    res.json({ success: true, data: cached });
    return;
  }

  const topics = await prisma.newsTopic.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, description: true, icon: true, color: true },
  });

  await cacheSet(cacheKey, topics, CACHE_TTL.TOPIC_LIST);
  res.json({ success: true, data: topics });
});

// ── GET /sources ──────────────────────────────────────────────────────────────

router.get('/sources', async (_req: Request, res: Response): Promise<void> => {
  const sources = await prisma.newsSource.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, websiteUrl: true, logoUrl: true, bias: true, region: true },
  });
  res.json({ success: true, data: sources });
});

// ── GET /trending ─────────────────────────────────────────────────────────────

router.get('/trending', async (_req: Request, res: Response): Promise<void> => {
  const cacheKey = 'news:trending';
  const cached = await cacheGet<unknown[]>(cacheKey);
  if (cached) {
    res.json({ success: true, data: cached });
    return;
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const stories = await prisma.newsStory.findMany({
    where: { isPublished: true, publishedAt: { gte: since } },
    orderBy: { viewCount: 'desc' },
    take: 10,
    select: {
      id: true,
      headline: true,
      slug: true,
      summary: true,
      publishedAt: true,
      viewCount: true,
      topic: { select: { name: true, slug: true, color: true } },
      countries: { select: { name: true, code: true, flag: true } },
    },
  });

  await cacheSet(cacheKey, stories, CACHE_TTL.TRENDING);
  res.json({ success: true, data: stories });
});

// ── GET /stories ──────────────────────────────────────────────────────────────

const storiesQuerySchema = z.object({
  topic: z.string().optional(),
  country: z.string().length(2).optional(),
  q: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  published: z.enum(['true', 'false']).optional(),
});

router.get('/stories', async (req: Request, res: Response): Promise<void> => {
  const parsed = storiesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid query parameters', code: 'VALIDATION_ERROR' });
    return;
  }

  const { topic, country, q, page, pageSize, published } = parsed.data;
  const skip = (page - 1) * pageSize;

  const where: Parameters<typeof prisma.newsStory.findMany>[0]['where'] = {
    isPublished: published === 'false' ? false : true,
  };

  if (topic) {
    where.topic = { slug: topic };
  }

  if (country) {
    where.countries = { some: { code: country.toUpperCase() } };
  }

  if (q) {
    where.headline = { contains: q, mode: 'insensitive' };
  }

  const [stories, total] = await Promise.all([
    prisma.newsStory.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        headline: true,
        slug: true,
        summary: true,
        summaryStatus: true,
        publishedAt: true,
        viewCount: true,
        isPublished: true,
        topic: { select: { name: true, slug: true, color: true, icon: true } },
        countries: { select: { name: true, code: true, flag: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.newsStory.count({ where }),
  ]);

  res.json({
    success: true,
    data: stories,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: skip + pageSize < total,
      hasPrev: page > 1,
    },
  });
});

// ── GET /stories/:slug ────────────────────────────────────────────────────────

router.get('/stories/:slug', async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const cacheKey = `news:story:slug:${slug}`;
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) {
    res.json({ success: true, data: cached });
    return;
  }

  const story = await prisma.newsStory.findUnique({
    where: { slug },
    select: {
      id: true,
      headline: true,
      slug: true,
      summary: true,
      summaryStatus: true,
      publishedAt: true,
      isPublished: true,
      viewCount: true,
      tagsConfirmed: true,
      topic: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      countries: { select: { id: true, name: true, code: true, flag: true } },
      sources: {
        select: {
          id: true,
          originalUrl: true,
          excerpt: true,
          source: { select: { name: true, slug: true, logoUrl: true, bias: true } },
        },
      },
      opinions: {
        where: { isPublished: true },
        select: {
          id: true,
          content: true,
          publishedAt: true,
          author: { select: { id: true, name: true, username: true, avatarUrl: true, level: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: 10,
      },
      _count: { select: { comments: true } },
    },
  });

  if (!story) {
    res.status(404).json({ success: false, error: 'Story not found', code: 'NOT_FOUND' });
    return;
  }

  if (!story.isPublished) {
    res.status(404).json({ success: false, error: 'Story not found', code: 'NOT_FOUND' });
    return;
  }

  await cacheSet(cacheKey, story, CACHE_TTL.NEWS_STORY);
  res.json({ success: true, data: story });
});

// ── POST /stories/:slug/view ──────────────────────────────────────────────────

router.post('/stories/:slug/view', async (req: Request, res: Response): Promise<void> => {
  // Rate-limit view counting via Redis: 1 increment per IP per story per hour
  const ip = req.ip ?? 'unknown';
  const { slug } = req.params;
  const viewKey = `view:${slug}:${ip}`;

  const alreadyViewed = await redis.get(viewKey);
  if (!alreadyViewed) {
    await redis.setex(viewKey, 3600, '1');
    await prisma.newsStory.updateMany({
      where: { slug, isPublished: true },
      data: { viewCount: { increment: 1 } },
    });
  }

  res.json({ success: true, data: null });
});

// ── PATCH /stories/:id/publish (EDITOR only) ──────────────────────────────────

router.patch(
  '/stories/:id/publish',
  authenticate,
  requireRole('EDITOR', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { publish } = z.object({ publish: z.boolean() }).parse(req.body);

    const story = await prisma.newsStory.update({
      where: { id },
      data: { isPublished: publish, publishedAt: publish ? new Date() : undefined },
      select: { id: true, headline: true, isPublished: true },
    });

    // Invalidate cache
    await redis.del(`news:story:slug:${story.id}`);

    res.json({ success: true, data: story });
  },
);

// ── PATCH /stories/:id/topic (EDITOR only) ───────────────────────────────────

router.patch(
  '/stories/:id/topic',
  authenticate,
  requireRole('EDITOR', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { topicId } = z.object({ topicId: z.string().uuid() }).parse(req.body);

    const story = await prisma.newsStory.update({
      where: { id },
      data: { topicId, tagsConfirmed: true },
      select: { id: true, headline: true, topicId: true },
    });

    res.json({ success: true, data: story });
  },
);

export { router as newsRouter };

// ── GET /stats ─────────────────────────────────────────────────────────────────

router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  const [
    storyCount,
    opinionCount,
    researcherCount,
    memberCount,
  ] = await Promise.all([
    prisma.newsStory.count({ where: { isPublished: true } }),
    prisma.comment.count({ where: { status: 'OPINION_VERIFIED' } }),
    prisma.user.count({ where: { role: { in: ['FIELD_EXPERT', 'LEADER'] }, isActive: true } }),
    prisma.user.count({ where: { role: 'MEMBER', isActive: true } }),
  ]);

  res.json({
    success: true,
    data: {
      totalStories: storyCount,
      verifiedOpinions: opinionCount,
      activeResearchers: researcherCount,
      members: memberCount,
    },
  });
});
