// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — JWT Token Management
//
// Access token:  15-minute lifetime, stored in Zustand memory on client.
//                Sent via Authorization: Bearer header.
//                NEVER stored in localStorage.
//
// Refresh token: 7-day lifetime, stored in HTTP-only cookie.
//                JavaScript cannot access it (XSS protection).
//                Rotated on every use (replay attack prevention).
// ─────────────────────────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import type { Response, CookieOptions } from 'express';

export interface JWTPayload {
  userId: string;
  role: string;
  level: string;
  tokenId: string; // Unique per token — used for Redis key and rotation tracking
}

export interface RefreshPayload {
  userId: string;
  tokenId: string;
}

const ACCESS_SECRET = (): string => {
  const s = process.env['JWT_SECRET'];
  if (!s) throw new Error('JWT_SECRET is not set');
  return s;
};

const REFRESH_SECRET = (): string => {
  const s = process.env['JWT_REFRESH_SECRET'];
  if (!s) throw new Error('JWT_REFRESH_SECRET is not set');
  return s;
};

const ISSUER = 'ims-news-central';
const AUDIENCE = 'ims-client';

// ── Token generation ──────────────────────────────────────────────────────────

export function generateAccessToken(payload: Omit<JWTPayload, 'tokenId'>): string {
  const tokenId = randomBytes(16).toString('hex');
  return jwt.sign({ ...payload, tokenId }, ACCESS_SECRET(), {
    expiresIn: '15m',
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

export function generateRefreshToken(userId: string): { token: string; tokenId: string } {
  const tokenId = randomBytes(16).toString('hex');
  const token = jwt.sign({ userId, tokenId }, REFRESH_SECRET(), {
    expiresIn: '7d',
    issuer: ISSUER,
  });
  return { token, tokenId };
}

// ── Token verification ────────────────────────────────────────────────────────

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, ACCESS_SECRET(), {
    issuer: ISSUER,
    audience: AUDIENCE,
  }) as JWTPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, REFRESH_SECRET(), {
    issuer: ISSUER,
  }) as RefreshPayload;
}

// ── Cookie management ─────────────────────────────────────────────────────────

const COOKIE_NAME = 'ims_refresh';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions: CookieOptions = {
  httpOnly: true,        // JavaScript cannot access — XSS protection
  secure: true,          // HTTPS only
  sameSite: 'strict',    // CSRF protection
  maxAge: SEVEN_DAYS_MS,
  path: '/api/v1/auth',  // Cookie only sent to auth routes
};

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    secure: process.env['NODE_ENV'] === 'production', // Allow HTTP in dev
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    path: '/api/v1/auth',
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
  });
}

export function getRefreshTokenFromCookie(cookies: Record<string, string>): string | undefined {
  return cookies[COOKIE_NAME];
}

// ── Redis key helpers ─────────────────────────────────────────────────────────
// Format: refresh:{userId}:{tokenId}
// TTL matches refresh token lifetime (7 days)

export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function refreshTokenRedisKey(userId: string, tokenId: string): string {
  return `refresh:${userId}:${tokenId}`;
}
