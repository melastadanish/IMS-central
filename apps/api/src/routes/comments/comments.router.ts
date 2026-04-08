// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Comments Router
//
// GET    /api/v1/comments?storyId=           Get published comments for story
// POST   /api/v1/comments                    Submit a comment (auth required)
// POST   /api/v1/comments/:id/like           Toggle like
// POST   /api/v1/comments/:id/request-points Request opinion points (author only)
//
// EDITOR queue:
// GET    /api/v1/queue/editor                Comments pending editor approval
// POST   /api/v1/queue/editor/:id/decide     Approve or reject
//
// EXPERT queue:
// GET    /api/v1/queue/expert                Comments pending expert review (filtered to field)
// POST   /api/v1/queue/expert/:id/approve    Expert approve
// POST   /api/v1/queue/expert/:id/reject     Expert reject
//
// LEADER queue:
// GET    /api/v1/queue/leader                Comments pending leader review
// POST   /api/v1/queue/leader/:id/approve    Leader approve
// POST   /api/v1/queue/leader/:id/reject     Leader reject
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as commentsService from '../../services/comments.service.js';
import { prisma } from '../../lib/prisma.js';
import { logger } from '../../lib/logger.js';

const router = Router();

// ── GET /comments ─────────────────────────────────────────────────────────────

const listQuerySchema = z.object({
  storyId: z.string().uuid(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

router.get('/', optionalAuthenticate, async (req: Request, res: Response): Promise<void> => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'storyId is required', code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const result = await commentsService.getStoryComments({
      storyId: parsed.data.storyId,
      viewerUserId: req.user?.id,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    });
    res.json(result);
  } catch (err) {
    logger.error({ err }, 'Get comments error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── POST /comments ────────────────────────────────────────────────────────────

const submitSchema = z.object({
  storyId: z.string().uuid(),
  content: z.string().min(50, 'Comment must be at least 50 characters').max(5000, 'Comment too long'),
  requiredField: z.string().max(50).optional(),
  parentId: z.string().uuid().optional(),
});

router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input', code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const result = await commentsService.submitComment({
      ...parsed.data,
      authorId: req.user!.id,
    });

    if (!result.success) {
      res.status(result.code === 'NOT_FOUND' ? 404 : 400).json(result);
      return;
    }

    res.status(201).json(result);
  } catch (err) {
    logger.error({ err }, 'Submit comment error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── POST /comments/:id/like ───────────────────────────────────────────────────

router.post('/:id/like', authenticate, async (req: Request, res: Response): Promise<void> => {
  const { id: commentId } = req.params;
  const userId = req.user!.id;

  try {
    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { commentId_userId: { commentId, userId } } });
      res.json({ success: true, data: { liked: false } });
    } else {
      await prisma.commentLike.create({ data: { commentId, userId } });
      res.json({ success: true, data: { liked: true } });
    }
  } catch (err) {
    logger.error({ err }, 'Like toggle error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── POST /comments/:id/request-points ────────────────────────────────────────

router.post('/:id/request-points', authenticate, async (req: Request, res: Response): Promise<void> => {
  const { id: commentId } = req.params;

  try {
    const result = await commentsService.requestOpinionPoints({
      commentId,
      memberId: req.user!.id,
    });

    if (!result.success) {
      const statusMap: Record<string, number> = { NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATE: 400, ALREADY_REQUESTED: 409 };
      res.status(statusMap[result.code] ?? 400).json(result);
      return;
    }

    res.json(result);
  } catch (err) {
    logger.error({ err }, 'Request opinion points error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── EDITOR QUEUE ──────────────────────────────────────────────────────────────

router.get(
  '/queue/editor',
  authenticate,
  requireRole('EDITOR', 'ADMIN'),
  async (_req: Request, res: Response): Promise<void> => {
    const comments = await prisma.comment.findMany({
      where: { status: 'PENDING_EDITOR' },
      orderBy: { submittedAt: 'asc' },
      take: 50,
      select: {
        id: true,
        content: true,
        status: true,
        requiredField: true,
        submittedAt: true,
        createdAt: true,
        author: { select: { id: true, name: true, username: true, avatarUrl: true, level: true } },
        story: { select: { id: true, headline: true, slug: true } },
      },
    });
    res.json({ success: true, data: comments });
  },
);

const editorDecideSchema = z.object({
  approve: z.boolean(),
  rejectionReason: z.string().max(500).optional(),
});

router.post(
  '/queue/editor/:id/decide',
  authenticate,
  requireRole('EDITOR', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const parsed = editorDecideSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' });
      return;
    }

    try {
      const result = await commentsService.editorDecision({
        commentId: req.params['id']!,
        editorId: req.user!.id,
        ...parsed.data,
      });

      if (!result.success) {
        res.status(result.code === 'NOT_FOUND' ? 404 : 400).json(result);
        return;
      }

      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Editor decision error');
      res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  },
);

// ── EXPERT QUEUE ──────────────────────────────────────────────────────────────

router.get(
  '/queue/expert',
  authenticate,
  requireRole('FIELD_EXPERT', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const expertProfile = req.user!.fieldExpertProfile;
    if (!expertProfile) {
      res.status(403).json({ success: false, error: 'Field expert profile not found', code: 'FORBIDDEN' });
      return;
    }

    const comments = await prisma.comment.findMany({
      where: {
        status: { in: ['PENDING_OPINION_REVIEW'] },
        fieldExpertApproverId: null,
        // Filter to this expert's approved field
        OR: [
          { requiredField: expertProfile.approvedField },
          { requiredField: null },
        ],
      },
      orderBy: { opinionRequestedAt: 'asc' },
      take: 50,
      select: {
        id: true,
        content: true,
        status: true,
        requiredField: true,
        opinionRequestedAt: true,
        author: { select: { id: true, name: true, username: true, level: true } },
        story: { select: { id: true, headline: true, slug: true } },
      },
    });

    res.json({ success: true, data: comments });
  },
);

router.post(
  '/queue/expert/:id/approve',
  authenticate,
  requireRole('FIELD_EXPERT', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const expertProfile = req.user!.fieldExpertProfile;
    if (!expertProfile) {
      res.status(403).json({ success: false, error: 'Field expert profile not found', code: 'FORBIDDEN' });
      return;
    }

    try {
      const result = await commentsService.expertApproveOpinion({
        commentId: req.params['id']!,
        expertUserId: req.user!.id,
        approvedField: expertProfile.approvedField,
      });

      if (!result.success) {
        const statusMap: Record<string, number> = {
          NOT_FOUND: 404,
          INVALID_STATE: 400,
          ALREADY_APPROVED: 409,
          FIELD_BOUNDARY_VIOLATION: 403,
        };
        res.status(statusMap[result.code] ?? 400).json(result);
        return;
      }

      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Expert approve error');
      res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  },
);

router.post(
  '/queue/expert/:id/reject',
  authenticate,
  requireRole('FIELD_EXPERT', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const { reason } = z.object({ reason: z.string().max(500).optional() }).parse(req.body);

    try {
      const result = await commentsService.rejectOpinion({
        commentId: req.params['id']!,
        rejectorId: req.user!.id,
        reason,
      });

      if (!result.success) {
        res.status(result.code === 'NOT_FOUND' ? 404 : 400).json(result);
        return;
      }

      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Expert reject error');
      res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  },
);

// ── LEADER QUEUE ──────────────────────────────────────────────────────────────

router.get(
  '/queue/leader',
  authenticate,
  requireRole('LEADER', 'ADMIN'),
  async (_req: Request, res: Response): Promise<void> => {
    const comments = await prisma.comment.findMany({
      where: {
        status: { in: ['PENDING_OPINION_REVIEW', 'OPINION_EXPERT_APPROVED'] },
        leaderApproverId: null,
      },
      orderBy: { opinionRequestedAt: 'asc' },
      take: 50,
      select: {
        id: true,
        content: true,
        status: true,
        requiredField: true,
        opinionRequestedAt: true,
        fieldExpertApproverId: true,
        author: { select: { id: true, name: true, username: true, level: true } },
        story: { select: { id: true, headline: true, slug: true } },
      },
    });

    res.json({ success: true, data: comments });
  },
);

router.post(
  '/queue/leader/:id/approve',
  authenticate,
  requireRole('LEADER', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await commentsService.leaderApproveOpinion({
        commentId: req.params['id']!,
        leaderUserId: req.user!.id,
      });

      if (!result.success) {
        const statusMap: Record<string, number> = { NOT_FOUND: 404, INVALID_STATE: 400, ALREADY_APPROVED: 409 };
        res.status(statusMap[result.code] ?? 400).json(result);
        return;
      }

      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Leader approve error');
      res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  },
);

router.post(
  '/queue/leader/:id/reject',
  authenticate,
  requireRole('LEADER', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const { reason } = z.object({ reason: z.string().max(500).optional() }).parse(req.body);

    try {
      const result = await commentsService.rejectOpinion({
        commentId: req.params['id']!,
        rejectorId: req.user!.id,
        reason,
      });

      if (!result.success) {
        res.status(result.code === 'NOT_FOUND' ? 404 : 400).json(result);
        return;
      }

      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Leader reject error');
      res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  },
);

export { router as commentsRouter };
