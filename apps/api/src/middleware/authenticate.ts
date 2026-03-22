// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Authentication Middleware
//
// authenticate:         Required auth. Returns 401 if token missing or invalid.
// optionalAuthenticate: Continues with req.user = null if no token present.
//
// Attaches to req.user: { id, role, level, fieldExpertProfile }
// ─────────────────────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export interface AuthUser {
  id: string;
  role: string;
  level: string;
  email: string;
  name: string;
  fieldExpertProfile: {
    id: string;
    approvedField: string;
  } | null;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser | null;
    }
  }
}

async function resolveUser(userId: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: {
        id: true,
        role: true,
        level: true,
        email: true,
        name: true,
        fieldExpertProfile: {
          select: { id: true, approvedField: true },
        },
      },
    });
    return user as AuthUser | null;
  } catch (err) {
    logger.error({ err, userId }, 'Failed to resolve user in authenticate middleware');
    return null;
  }
}

function extractBearerToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7) || null;
}

/**
 * Required authentication middleware.
 * Attaches req.user and calls next() on success.
 * Returns 401 if token is missing, invalid, or user not found.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractBearerToken(req);

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required', code: 'UNAUTHORIZED' });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await resolveUser(payload.userId);

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found or inactive', code: 'UNAUTHORIZED' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token', code: 'UNAUTHORIZED' });
  }
}

/**
 * Optional authentication middleware.
 * Sets req.user = null if no token is present or token is invalid.
 * Never returns 401 — always calls next().
 */
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractBearerToken(req);

  if (!token) {
    req.user = null;
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = await resolveUser(payload.userId);
  } catch {
    req.user = null;
  }

  next();
}
