// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — News Router
// GET  /api/v1/news/stories           Paginated feed (with filters)
// GET  /api/v1/news/stories/:slug     Single story with sources + summary
// GET  /api/v1/news/topics            All topics with story counts
// GET  /api/v1/news/trending          Top 5 trending stories
// POST /api/v1/news/stories           Admin create story
// PATCH /api/v1/news/stories/:id/tags Editor confirm tags
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { redis, CACHE_TTL, cacheGet, cacheSet, cacheDelete } from '../../lib/redis.js';
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
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      color: true,
      _count: { select: { stories: { where: { isPublished: true } } } },
    },
  });

  const formatted = topics.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    icon: t.icon,
    color: t.color,
    storyCount: t._count.stories,
  }));

  await cacheSet(cacheKey, formatted, CACHE_TTL.NEWS_TOPICS);
  res.json({ success: true, data: formatted });
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
    take: 5,
    select: {
      id: true,
      headline: true,
      slug: true,
      aiSummary: true,
      publishedAt: true,
      viewCount: true,
      topic: { select: { name: true, slug: true, color: true, icon: true } },
      country: { select: { name: true, code: true, flagEmoji: true } },
      _count: { select: { sources: true, opinions: true, comments: true } },
    },
  });

  const formatted = stories.map((s) => ({
    id: s.id,
    headline: s.headline,
    slug: s.slug,
    aiSummary: s.aiSummary,
    publishedAt: s.publishedAt,
    viewCount: s.viewCount,
    topic: s.topic,
    country: s.country,
    sourceCount: s._count.sources,
    opinionCount: s._count.opinions,
    commentCount: s._count.comments,
  }));

  await cacheSet(cacheKey, formatted, CACHE_TTL.NEWS_TRENDING);
  res.json({ success: true, data: formatted });
});

// ── GET /stories ──────────────────────────────────────────────────────────────

const storiesQuerySchema = z.object({
  topic: z.string().optional(),
  country: z.string().length(2).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  hasLeaderOpinion: z.enum(['true', 'false']).optional(),
  hasExpertOpinion: z.enum(['true', 'false']).optional(),
  q: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

router.get('/stories', async (req: Request, res: Response): Promise<void> => {
  const parsed = storiesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid query parameters', details: parsed.error.issues, code: 'VALIDATION_ERROR' });
    return;
  }

  const { topic, country, dateFrom, dateTo, hasLeaderOpinion, hasExpertOpinion, q, page, pageSize } = parsed.data;
  const skip = (page - 1) * pageSize;

  const where: Parameters<typeof prisma.newsStory.findMany>[0]['where'] = {
    isPublished: true,
  };

  if (topic) {
    where.topic = { slug: topic };
  }

  if (country) {
    where.country = { code: country.toUpperCase() };
  }

  if (dateFrom || dateTo) {
    where.publishedAt = {};
    if (dateFrom) where.publishedAt.gte = new Date(dateFrom);
    if (dateTo) where.publishedAt.lte = new Date(dateTo);
  }

  if (hasLeaderOpinion === 'true') {
    where.opinions = { some: { status: 'PUBLISHED', authorType: 'IMS_LEADER' } };
  } else if (hasLeaderOpinion === 'false') {
    where.opinions = { none: { status: 'PUBLISHED', authorType: 'IMS_LEADER' } };
  }

  if (hasExpertOpinion === 'true') {
    where.opinions = { some: { status: 'PUBLISHED', authorType: 'EXTERNAL_EXPERT' } };
  } else if (hasExpertOpinion === 'false') {
    where.opinions = { none: { status: 'PUBLISHED', authorType: 'EXTERNAL_EXPERT' } };
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { aiSummary: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [stories, total] = await Promise.all([
    prisma.newsStory.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        aiSummary: true,
        summaryStatus: true,
        publishedAt: true,
        viewCount: true,
        isPublished: true,
        topic: { select: { name: true, slug: true, color: true, icon: true } },
        country: { select: { name: true, code: true, flagEmoji: true } },
        _count: { select: { sources: true, opinions: true, comments: true } },
      },
    }),
    prisma.newsStory.count({ where }),
  ]);

  const formatted = stories.map((s) => ({
    id: s.id,
    headline: s.title,
    slug: s.slug,
    aiSummary: s.aiSummary,
    summaryStatus: s.summaryStatus,
    publishedAt: s.publishedAt,
    viewCount: s.viewCount,
    topic: s.topic,
    country: s.country,
    sourceCount: s._count.sources,
    opinionCount: s._count.opinions,
    commentCount: s._count.comments,
  }));

  res.json({
    success: true,
    data: formatted,
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
      title: true,
      slug: true,
      aiSummary: true,
      summaryStatus: true,
      publishedAt: true,
      isPublished: true,
      viewCount: true,
      tagsConfirmedAt: true,
      topics: true,
      countries: true,
      topic: { select: { id: true, name: true, slug: true, color: true, icon: true } },
      country: { select: { id: true, name: true, code: true, flagEmoji: true } },
      sources: {
        select: {
          id: true,
          originalUrl: true,
          originalTitle: true,
          excerpt: true,
          publishedAt: true,
          source: { select: { id: true, name: true, slug: true, logoUrl: true, bias: true, websiteUrl: true } },
        },
      },
      opinions: {
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          content: true,
          authorType: true,
          publishedAt: true,
          author: { select: { id: true, name: true, username: true, avatarUrl: true, level: true } },
        },
        orderBy: { publishedAt: 'desc' },
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

  const leaderOpinions = story.opinions.filter((o) => o.authorType === 'IMS_LEADER');
  const expertOpinions = story.opinions.filter((o) => o.authorType === 'EXTERNAL_EXPERT');

  const formatted = {
    id: story.id,
    title: story.title,
    slug: story.slug,
    aiSummary: story.aiSummary,
    summaryStatus: story.summaryStatus,
    publishedAt: story.publishedAt,
    viewCount: story.viewCount,
    tagsConfirmedAt: story.tagsConfirmedAt,
    topics: story.topics,
    countries: story.countries,
    topic: story.topic,
    country: story.country,
    sources: story.sources,
    leaderOpinions,
    expertOpinions,
    commentCount: story._count.comments,
  };

  await cacheSet(cacheKey, formatted, CACHE_TTL.NEWS_STORY);
  res.json({ success: true, data: formatted });
});

// ── POST /stories (ADMIN only) ───────────────────────────────────────────────

const createStorySchema = z.object({
  title: z.string().min(1).max(500),
  aiSummary: z.string().optional(),
  topicSlug: z.string().optional(),
  countryCode: z.string().length(2).optional(),
  topics: z.array(z.string()).default([]),
  countries: z.array(z.string()).default([]),
  sources: z.array(z.object({
    originalUrl: z.string().url(),
    originalTitle: z.string(),
    excerpt: z.string().optional(),
  })).default([]),
});

router.post(
  '/stories',
  authenticate,
  requireRole('ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const parsed = createStorySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid request body', details: parsed.error.issues, code: 'VALIDATION_ERROR' });
      return;
    }

    const { title, aiSummary, topicSlug, countryCode, topics, countries, sources } = parsed.data;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now().toString(36);

    const story = await prisma.newsStory.create({
      data: {
        canonicalHash: Buffer.from(slug).toString('base64'),
        title,
        slug,
        aiSummary: aiSummary ?? null,
        summaryStatus: aiSummary ? 'DONE' : 'PENDING',
        topics,
        countries,
        isPublished: true,
        publishedAt: new Date(),
        topic: topicSlug ? { connect: { slug: topicSlug } } : undefined,
        country: countryCode ? { connect: { code: countryCode.toUpperCase() } } : undefined,
        sources: sources.length > 0 ? {
          create: sources.map((s) => ({
            originalUrl: s.originalUrl,
            originalTitle: s.originalTitle,
            excerpt: s.excerpt ?? null,
            source: { connect: { rssUrl: s.originalUrl } },
          })),
        } : undefined,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        aiSummary: true,
        isPublished: true,
        publishedAt: true,
      },
    });

    await cacheDelete('news:topics:all');
    await cacheDelete('news:trending');
    await cacheDelete('news:stories:*');

    logger.info({ storyId: story.id, userId: req.user?.id }, 'News story created');
    res.status(201).json({ success: true, data: story });
  },
);

// ── PATCH /stories/:id/tags (EDITOR only) ────────────────────────────────────

const confirmTagsSchema = z.object({
  topics: z.array(z.string()).default([]),
  countries: z.array(z.string()).default([]),
  confirm: z.boolean(),
});

router.patch(
  '/stories/:id/tags',
  authenticate,
  requireRole('EDITOR', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = confirmTagsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid request body', details: parsed.error.issues, code: 'VALIDATION_ERROR' });
      return;
    }

    const { topics, countries, confirm } = parsed.data;

    const existingStory = await prisma.newsStory.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!existingStory) {
      res.status(404).json({ success: false, error: 'Story not found', code: 'NOT_FOUND' });
      return;
    }

    const updateData: Parameters<typeof prisma.newsStory.update>[0]['data'] = {};
    if (confirm) {
      updateData.topics = topics;
      updateData.countries = countries;
      updateData.tagsConfirmedAt = new Date();
    } else {
      updateData.topics = topics;
      updateData.countries = countries;
    }

    const story = await prisma.newsStory.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        topics: true,
        countries: true,
        tagsConfirmedAt: true,
      },
    });

    await cacheDelete(`news:story:slug:${existingStory.slug}`);

    res.json({ success: true, data: story });
  },
);

// ── POST /stories/:slug/view ──────────────────────────────────────────────────

router.post('/stories/:slug/view', async (req: Request, res: Response): Promise<void> => {
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
      select: { id: true, title: true, isPublished: true, slug: true },
    });

    await cacheDelete(`news:story:slug:${story.slug}`);
    await cacheDelete('news:trending');

    res.json({ success: true, data: story });
  },
);

export { router as newsRouter };
