// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Auth Router
// POST /api/v1/auth/register
// POST /api/v1/auth/login
// POST /api/v1/auth/logout
// POST /api/v1/auth/logout-all
// POST /api/v1/auth/refresh
// GET  /api/v1/auth/me
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { registerSchema, loginSchema } from './auth.validation.js';
import * as authService from '../../services/auth.service.js';
import { authenticate } from '../../middleware/authenticate.js';
import { logger } from '../../lib/logger.js';

const router = Router();

// ── Validation helper ─────────────────────────────────────────────────────────

function validate<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> | null {
  const result = schema.safeParse(data);
  if (!result.success) return null;
  return result.data as z.infer<T>;
}

// ── POST /register ────────────────────────────────────────────────────────────

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parsed = validate(registerSchema, { body: req.body });
  if (!parsed) {
    res.status(400).json({ success: false, error: 'Invalid request body', code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const result = await authService.register(parsed.body, res);
    if (!result.success) {
      const statusMap: Record<string, number> = {
        WEAK_PASSWORD: 400,
        EMAIL_TAKEN: 409,
        USERNAME_TAKEN: 409,
      };
      res.status(statusMap[result.code] ?? 400).json(result);
      return;
    }
    res.status(201).json(result);
  } catch (err) {
    logger.error({ err }, 'Register error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── POST /login ───────────────────────────────────────────────────────────────

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = validate(loginSchema, { body: req.body });
  if (!parsed) {
    res.status(400).json({ success: false, error: 'Invalid email or password format', code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const result = await authService.login(parsed.body, res);
    if (!result.success) {
      res.status(401).json(result);
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    logger.error({ err }, 'Login error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── POST /refresh ─────────────────────────────────────────────────────────────

router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const cookieToken = req.cookies?.['refreshToken'] as string | undefined;

  if (!cookieToken) {
    res.status(401).json({ success: false, error: 'No refresh token', code: 'UNAUTHORIZED' });
    return;
  }

  try {
    const result = await authService.refreshTokens(cookieToken, res);
    if (!result.success) {
      res.status(401).json(result);
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    logger.error({ err }, 'Token refresh error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── POST /logout ──────────────────────────────────────────────────────────────

router.post('/logout', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const cookieToken = req.cookies?.['refreshToken'] as string | undefined;
    const result = await authService.logout(req.user!.id, cookieToken, res);
    res.status(200).json(result);
  } catch (err) {
    logger.error({ err }, 'Logout error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── POST /logout-all ──────────────────────────────────────────────────────────

router.post('/logout-all', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.logoutAll(req.user!.id, res);
    res.status(200).json(result);
  } catch (err) {
    logger.error({ err }, 'Logout-all error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ── GET /me ───────────────────────────────────────────────────────────────────

router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.getMe(req.user!.id);
    if (!result.success) {
      res.status(404).json(result);
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    logger.error({ err }, 'Get me error');
    res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

export { router as authRouter };
