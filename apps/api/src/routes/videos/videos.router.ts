// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Videos Router
//
// GET  /api/v1/videos                      Paginated video list
// GET  /api/v1/videos/:slug                Single video (no embed URL)
// GET  /api/v1/videos/:id/player-url       Signed playback URL (auth required)
// GET  /api/v1/videos/:id/status           Encoding status (poll while PROCESSING)
// POST /api/v1/videos/upload/init          Init Bunny TUS upload
// POST /api/v1/videos/:id/thumbnail        Set custom thumbnail
// POST /api/v1/videos/:id/publish          Publish video
// POST /api/v1/videos/:id/unpublish        Unpublish video
// DELETE /api/v1/videos/:id               Delete from DB + Bunny
// POST /api/v1/webhooks/bunny-stream       Bunny webhook (encoding status)
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import {
  createBunnyVideo,
  deleteBunnyVideo,
  generateSignedEmbedUrl,
  generateTusUploadHeaders,
  getThumbnailUrl,
  getTusUploadUrl,
  getBunnyVideo,
  verifyBunnyWebhookSignature,
  bunnyStatusToAppStatus,
} from '../../services/bunny-stream.service.js';
import { logger } from '../../lib/logger.js';

const router = Router();

// ── GET /videos ───────────────────────────────────────────────────────────────

const listQuerySchema = z.object({
  topic: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid query', code: 'VALIDATION_ERROR' });
    return;
  }

  const { topic, difficulty, page, pageSize } = parsed.data;
  const skip = (page - 1) * pageSize;

  const where: Parameters<typeof prisma.video.findMany>[0]['where'] = { isPublished: true };
  if (topic) where.topic = { slug: topic };
  if (difficulty) where.difficulty = difficulty;

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
        duration: true,
        thumbnailUrl: true,
        uploadStatus: true,
        publishedAt: true,
        topic: { select: { name: true, slug: true, color: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.video.count({ where }),
  ]);

  res.json({
    success: true,
    data: videos,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasNext: skip + pageSize < total, hasPrev: page > 1 },
  });
});

// ── GET /videos/:slug ─────────────────────────────────────────────────────────

router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  const video = await prisma.video.findUnique({
    where: { slug: req.params['slug'] },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      discussionBrief: true,
      difficulty: true,
      duration: true,
      thumbnailUrl: true,
      uploadStatus: true,
      encodingStatus: true,
      publishedAt: true,
      tags: true,
      externalEmbedType: true,
      bunnyVideoId: true,
      topic: { select: { name: true, slug: true, color: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!video || !video.uploadStatus) {
    res.status(404).json({ success: false, error: 'Video not found', code: 'NOT_FOUND' });
    return;
  }

  // Don't return embed IDs — use /player-url endpoint
  res.json({ success: true, data: video });
});

// ── GET /videos/:id/player-url ────────────────────────────────────────────────

router.get('/:id/player-url', authenticate, async (req: Request, res: Response): Promise<void> => {
  const video = await prisma.video.findUnique({
    where: { id: req.params['id'] },
    select: {
      id: true,
      isPublished: true,
      uploadStatus: true,
      bunnyVideoId: true,
      bunnyLibraryId: true,
      externalEmbedType: true,
      externalEmbedId: true,
      externalEmbedUrl: true,
    },
  });

  if (!video || !video.isPublished) {
    res.status(404).json({ success: false, error: 'Video not found', code: 'NOT_FOUND' });
    return;
  }

  if (video.uploadStatus !== 'READY') {
    res.status(400).json({ success: false, error: 'Video is not ready for playback', code: 'VIDEO_NOT_READY' });
    return;
  }

  // Bunny Stream video
  if (video.bunnyVideoId) {
    const signedUrl = generateSignedEmbedUrl(video.bunnyVideoId);
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
    res.json({ success: true, data: { type: 'BUNNY', embedUrl: signedUrl, expiresAt } });
    return;
  }

  // External embed (YouTube/Vimeo/etc.)
  if (video.externalEmbedType && video.externalEmbedId) {
    let embedUrl: string;

    if (video.externalEmbedType === 'YOUTUBE') {
      // Always use nocookie domain
      embedUrl = `https://www.youtube-nocookie.com/embed/${video.externalEmbedId}?rel=0&modestbranding=1`;
    } else if (video.externalEmbedType === 'VIMEO') {
      embedUrl = `https://player.vimeo.com/video/${video.externalEmbedId}?dnt=1`;
    } else if (video.externalEmbedType === 'DAILYMOTION') {
      embedUrl = `https://www.dailymotion.com/embed/video/${video.externalEmbedId}`;
    } else {
      embedUrl = video.externalEmbedUrl ?? '';
    }

    res.json({ success: true, data: { type: video.externalEmbedType, embedUrl } });
    return;
  }

  res.status(400).json({ success: false, error: 'Video has no playback source', code: 'NO_SOURCE' });
});

// ── GET /videos/:id/status (poll while PROCESSING) ────────────────────────────

router.get('/:id/status', authenticate, async (req: Request, res: Response): Promise<void> => {
  const video = await prisma.video.findUnique({
    where: { id: req.params['id'] },
    select: { id: true, uploadStatus: true, encodingStatus: true, bunnyVideoId: true },
  });

  if (!video) {
    res.status(404).json({ success: false, error: 'Video not found', code: 'NOT_FOUND' });
    return;
  }

  // If PROCESSING and Bunny video exists, fetch live status
  if (video.uploadStatus === 'PROCESSING' && video.bunnyVideoId) {
    try {
      const bunnyData = await getBunnyVideo(video.bunnyVideoId);
      const appStatus = bunnyStatusToAppStatus(bunnyData.status);

      if (appStatus !== video.uploadStatus) {
        // Update DB
        await prisma.video.update({
          where: { id: video.id },
          data: {
            uploadStatus: appStatus,
            encodingStatus: String(bunnyData.status),
            duration: bunnyData.length || undefined,
            thumbnailUrl: bunnyData.thumbnailFileName ? getThumbnailUrl(video.bunnyVideoId) : undefined,
          },
        });
      }

      res.json({ success: true, data: { uploadStatus: appStatus, encodeProgress: bunnyData.encodeProgress } });
      return;
    } catch (err) {
      logger.error({ err, videoId: video.id }, 'Failed to fetch Bunny status');
    }
  }

  res.json({ success: true, data: { uploadStatus: video.uploadStatus, encodeProgress: null } });
});

// ── POST /videos/upload/init (EDITOR/ADMIN) ───────────────────────────────────

const uploadInitSchema = z.object({
  title: z.string().min(3).max(200),
  topicId: z.string().uuid(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  description: z.string().max(2000).optional(),
});

router.post(
  '/upload/init',
  authenticate,
  requireRole('EDITOR', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const parsed = uploadInitSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input', code: 'VALIDATION_ERROR' });
      return;
    }

    try {
      // 1. Create Bunny video entry
      const { videoId: bunnyVideoId, libraryId: bunnyLibraryId } = await createBunnyVideo(parsed.data.title);

      // 2. Generate TUS upload headers for browser
      const tusHeaders = generateTusUploadHeaders(bunnyVideoId);
      const tusUploadUrl = getTusUploadUrl(bunnyVideoId);

      // 3. Create DB record
      const slug = parsed.data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 80);

      const video = await prisma.video.create({
        data: {
          title: parsed.data.title,
          slug: `${slug}-${Date.now()}`,
          topicId: parsed.data.topicId,
          difficulty: parsed.data.difficulty,
          description: parsed.data.description ?? null,
          bunnyVideoId,
          bunnyLibraryId,
          uploadStatus: 'UPLOADING',
          isPublished: false,
          addedById: req.user!.id,
        },
        select: { id: true, title: true, slug: true, uploadStatus: true },
      });

      res.status(201).json({
        success: true,
        data: {
          video,
          bunnyVideoId,
          tusUploadUrl,
          uploadHeaders: tusHeaders,
        },
      });
    } catch (err) {
      logger.error({ err }, 'Upload init error');
      res.status(500).json({ success: false, error: 'Failed to initialize upload', code: 'INTERNAL_ERROR' });
    }
  },
);

// ── POST /videos/:id/thumbnail ────────────────────────────────────────────────

router.post(
  '/:id/thumbnail',
  authenticate,
  requireRole('EDITOR', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const video = await prisma.video.findUnique({
      where: { id: req.params['id'] },
      select: { id: true, bunnyVideoId: true },
    });

    if (!video?.bunnyVideoId) {
      res.status(404).json({ success: false, error: 'Video not found or not a Bunny video', code: 'NOT_FOUND' });
      return;
    }

    // Expect raw image bytes in body
    const imageBuffer = req.body as Buffer;
    if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
      res.status(400).json({ success: false, error: 'Image data required', code: 'VALIDATION_ERROR' });
      return;
    }

    try {
      const { setCustomThumbnail } = await import('../../services/bunny-stream.service.js');
      await setCustomThumbnail(video.bunnyVideoId, imageBuffer);

      const thumbnailUrl = getThumbnailUrl(video.bunnyVideoId);
      await prisma.video.update({ where: { id: video.id }, data: { thumbnailUrl } });

      res.json({ success: true, data: { thumbnailUrl } });
    } catch (err) {
      logger.error({ err }, 'Thumbnail upload error');
      res.status(500).json({ success: false, error: 'Failed to upload thumbnail', code: 'INTERNAL_ERROR' });
    }
  },
);

// ── POST /videos/:id/publish ──────────────────────────────────────────────────

router.post('/:id/publish', authenticate, requireRole('EDITOR', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  const video = await prisma.video.findUnique({
    where: { id: req.params['id'] },
    select: { id: true, uploadStatus: true },
  });

  if (!video) {
    res.status(404).json({ success: false, error: 'Video not found', code: 'NOT_FOUND' });
    return;
  }

  if (video.uploadStatus !== 'READY') {
    res.status(400).json({ success: false, error: 'Video must be READY before publishing', code: 'NOT_READY' });
    return;
  }

  await prisma.video.update({
    where: { id: video.id },
    data: { isPublished: true, publishedAt: new Date() },
  });

  res.json({ success: true, data: { id: video.id, isPublished: true } });
});

// ── POST /videos/:id/unpublish ────────────────────────────────────────────────

router.post('/:id/unpublish', authenticate, requireRole('EDITOR', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  await prisma.video.update({
    where: { id: req.params['id'] },
    data: { isPublished: false },
  });

  res.json({ success: true, data: { id: req.params['id'], isPublished: false } });
});

// ── DELETE /videos/:id ────────────────────────────────────────────────────────

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response): Promise<void> => {
  const video = await prisma.video.findUnique({
    where: { id: req.params['id'] },
    select: { id: true, bunnyVideoId: true },
  });

  if (!video) {
    res.status(404).json({ success: false, error: 'Video not found', code: 'NOT_FOUND' });
    return;
  }

  // Delete from Bunny first (avoid orphaned storage costs)
  if (video.bunnyVideoId) {
    try {
      await deleteBunnyVideo(video.bunnyVideoId);
    } catch (err) {
      logger.error({ err, videoId: video.id }, 'Failed to delete from Bunny — aborting DB delete');
      res.status(500).json({ success: false, error: 'Failed to delete from video CDN', code: 'BUNNY_DELETE_FAILED' });
      return;
    }
  }

  await prisma.video.delete({ where: { id: video.id } });

  res.json({ success: true, data: { deleted: true } });
});

// ── POST /webhooks/bunny-stream ───────────────────────────────────────────────
// Bunny calls this when encoding status changes.
// Must be registered as a separate router at /api/v1/webhooks/bunny-stream.

export const bunnyWebhookRouter = Router();

bunnyWebhookRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const {
    VideoGuid: videoId,
    LibraryId: libraryId,
    Status: status,
    VideoEncodeProgress: encodeProgress,
    Signature: signature,
    Timestamp: timestamp,
  } = req.body as Record<string, unknown>;

  // Verify webhook signature
  if (
    typeof videoId !== 'string' ||
    typeof libraryId !== 'number' ||
    typeof signature !== 'string' ||
    typeof timestamp !== 'string'
  ) {
    res.status(400).json({ success: false, error: 'Invalid webhook payload', code: 'BAD_REQUEST' });
    return;
  }

  if (!verifyBunnyWebhookSignature(videoId, libraryId, timestamp, signature)) {
    logger.warn({ videoId }, 'Bunny webhook signature verification failed');
    res.status(401).json({ success: false, error: 'Invalid signature', code: 'UNAUTHORIZED' });
    return;
  }

  const appStatus = bunnyStatusToAppStatus(Number(status));

  const video = await prisma.video.findFirst({
    where: { bunnyVideoId: videoId },
    select: { id: true, addedById: true },
  });

  if (!video) {
    // Not found — acknowledge anyway (may have been deleted)
    res.json({ success: true });
    return;
  }

  await prisma.video.update({
    where: { id: video.id },
    data: {
      uploadStatus: appStatus,
      encodingStatus: String(status),
      duration: undefined, // Will be updated on next status poll
      thumbnailUrl: appStatus === 'READY' ? getThumbnailUrl(videoId) : undefined,
    },
  });

  // Notify uploader on completion or failure
  if (appStatus === 'READY' || appStatus === 'FAILED') {
    await prisma.notification.create({
      data: {
        userId: video.addedById,
        type: appStatus === 'READY' ? 'VIDEO_READY' : 'VIDEO_FAILED',
        title: appStatus === 'READY' ? 'Video encoding complete' : 'Video encoding failed',
        body: appStatus === 'READY'
          ? 'Your video is ready to publish.'
          : 'Video encoding failed. Please try uploading again.',
      },
    }).catch(() => null);
  }

  logger.info({ videoId, appStatus, encodeProgress }, 'Bunny webhook processed');
  res.json({ success: true });
});

export { router as videosRouter };
