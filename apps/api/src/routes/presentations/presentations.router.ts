// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Presentations Router
//
// POST  /api/v1/presentations/request          Member requests presentation
// POST  /api/v1/presentations/:id/re-request   Re-request after Day 5
// POST  /api/v1/presentations/:id/escalate     Escalate after Day 10
// GET   /api/v1/presentations/my               Member's own requests
// GET   /api/v1/presentations/queue            Leader's queue
// POST  /api/v1/presentations/:id/schedule     Leader schedules
// GET   /api/v1/presentations/:id/meeting-link Get decrypted meeting link
// POST  /api/v1/presentations/:id/decision     Leader submits decision
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import * as presentationsService from '../../services/presentations.service.js';
import { logger } from '../../lib/logger.js';

const router = Router();

// ── POST /request ─────────────────────────────────────────────────────────────

router.post('/request', authenticate, async (req: Request, res: Response): Promise<void> => {
  const { leaderId } = z.object({ leaderId: z.string().uuid() }).parse(req.body);

  try {
    const result = await presentationsService.requestPresentation({
      memberId: req.user!.id,
      leaderId,
    });

    if (!result.success) {
      const statusMap: Record<string, number> = { ACTIVE_REQUEST_EXISTS: 409, LEADER_NOT_FOUND: 404 };
      res.status(statusMap[result.code] ?? 400).json(result);
      return;
    }

    res.status(201).json(result);
  } catch (err) {
    logger.error({ err }, 'Request presentation error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── POST /:id/re-request ──────────────────────────────────────────────────────

router.post('/:id/re-request', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await presentationsService.reRequestPresentation({
      requestId: req.params['id']!,
      memberId: req.user!.id,
    });

    if (!result.success) {
      const statusMap: Record<string, number> = { NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATE: 400, TOO_EARLY: 400 };
      res.status(statusMap[result.code] ?? 400).json(result);
      return;
    }

    res.json(result);
  } catch (err) {
    logger.error({ err }, 'Re-request error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── POST /:id/escalate ────────────────────────────────────────────────────────

router.post('/:id/escalate', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await presentationsService.escalatePresentation({
      requestId: req.params['id']!,
      memberId: req.user!.id,
    });

    if (!result.success) {
      const statusMap: Record<string, number> = { NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATE: 400, TOO_EARLY: 400 };
      res.status(statusMap[result.code] ?? 400).json(result);
      return;
    }

    res.json(result);
  } catch (err) {
    logger.error({ err }, 'Escalate error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── GET /my ───────────────────────────────────────────────────────────────────

router.get('/my', authenticate, async (req: Request, res: Response): Promise<void> => {
  const result = await presentationsService.getMyPresentations(req.user!.id);
  res.json(result);
});

// ── GET /queue (leader) ───────────────────────────────────────────────────────

router.get('/queue', authenticate, requireRole('LEADER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  const result = await presentationsService.getLeaderQueue(req.user!.id);
  res.json(result);
});

// ── POST /:id/schedule (leader) ───────────────────────────────────────────────

const scheduleSchema = z.object({
  scheduledFor: z.string().datetime(),
  platform: z.string(),
  meetingLink: z.string().url('Meeting link must be a valid URL').max(2000),
});

router.post(
  '/:id/schedule',
  authenticate,
  requireRole('LEADER', 'PLATFORM_MANAGER', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const parsed = scheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input', code: 'VALIDATION_ERROR' });
      return;
    }

    try {
      const result = await presentationsService.schedulePresentation({
        requestId: req.params['id']!,
        leaderId: req.user!.id,
        scheduledFor: new Date(parsed.data.scheduledFor),
        platform: parsed.data.platform,
        meetingLink: parsed.data.meetingLink,
      });

      if (!result.success) {
        const statusMap: Record<string, number> = { NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATE: 400, INVALID_DATE: 400, INVALID_PLATFORM: 400 };
        res.status(statusMap[result.code] ?? 400).json(result);
        return;
      }

      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Schedule error');
      res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  },
);

// ── GET /:id/meeting-link ─────────────────────────────────────────────────────

router.get('/:id/meeting-link', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await presentationsService.getMeetingLink({
      requestId: req.params['id']!,
      requestorId: req.user!.id,
      requestorRole: req.user!.role,
    });

    if (!result.success) {
      const statusMap: Record<string, number> = { NOT_FOUND: 404, FORBIDDEN: 403, NO_LINK: 404, NOT_SCHEDULED: 400, LINK_EXPIRED: 410 };
      res.status(statusMap[result.code] ?? 400).json(result);
      return;
    }

    res.json(result);
  } catch (err) {
    logger.error({ err }, 'Get meeting link error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── POST /:id/decision (leader) ───────────────────────────────────────────────

const decisionSchema = z.object({
  decision: z.enum(['APPROVED', 'CANCELLED']),
  leaderNote: z.string().max(2000).optional(),
  cancellationReason: z.string().max(2000).optional(),
  evidenceLink: z.string().url().max(2000).optional(),
});

router.post(
  '/:id/decision',
  authenticate,
  requireRole('LEADER', 'ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    const parsed = decisionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input', code: 'VALIDATION_ERROR' });
      return;
    }

    if (parsed.data.decision === 'CANCELLED' && !parsed.data.cancellationReason) {
      res.status(400).json({ success: false, error: 'Cancellation reason is required', code: 'VALIDATION_ERROR' });
      return;
    }

    try {
      const result = await presentationsService.submitDecision({
        requestId: req.params['id']!,
        leaderId: req.user!.id,
        ...parsed.data,
      });

      if (!result.success) {
        const statusMap: Record<string, number> = { NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATE: 400 };
        res.status(statusMap[result.code] ?? 400).json(result);
        return;
      }

      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Submit decision error');
      res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  },
);

export { router as presentationsRouter };
