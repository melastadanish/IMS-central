// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Auth Service
// Handles: register, login, refresh token rotation, logout
// ─────────────────────────────────────────────────────────────────────────────

import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../lib/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  refreshTokenRedisKey,
  REFRESH_TOKEN_TTL_SECONDS,
} from '../lib/jwt.js';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import type { RegisterInput, LoginInput } from '../routes/auth/auth.validation.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateUsername(name: string, suffix: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 25);
  return suffix === 0 ? base : `${base}-${suffix}`;
}

async function findAvailableUsername(name: string): Promise<string> {
  for (let i = 0; i <= 999; i++) {
    const candidate = generateUsername(name, i);
    const exists = await prisma.user.findUnique({ where: { username: candidate } });
    if (!exists) return candidate;
  }
  // Fallback with crypto random suffix
  const { randomBytes } = await import('crypto');
  return `${generateUsername(name, 0)}-${randomBytes(3).toString('hex')}`;
}

function buildPublicUser(user: {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  level: string;
  activePoints: number;
  bio: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: user.role,
    level: user.level,
    activePoints: user.activePoints,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}

// ── Service Functions ─────────────────────────────────────────────────────────

export async function register(input: RegisterInput, res: Response) {
  // Validate password strength
  const strength = validatePasswordStrength(input.password);
  if (!strength.valid) {
    return { success: false as const, code: 'WEAK_PASSWORD', error: strength.reason! };
  }

  // Check email uniqueness
  const existingEmail = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existingEmail) {
    return { success: false as const, code: 'EMAIL_TAKEN', error: 'An account with this email already exists' };
  }

  // Check username uniqueness (if provided) or generate one
  let username = input.username?.toLowerCase();
  if (username) {
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return { success: false as const, code: 'USERNAME_TAKEN', error: 'This username is already taken' };
    }
  } else {
    username = await findAvailableUsername(input.name);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name.trim(),
      username,
      role: 'MEMBER',
      level: 'MEMBER',
      memberType: 'STANDARD',
      isActive: true,
      isEmailVerified: false,
      pendingPoints: 0,
      activePoints: 0,
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      level: true,
      activePoints: true,
      bio: true,
      avatarUrl: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user.id, role: user.role, level: user.level });
  const { token: refreshToken, tokenId } = generateRefreshToken(user.id);

  // Store refresh token in Redis
  await redis.set(
    refreshTokenRedisKey(user.id, tokenId),
    '1',
    'EX',
    REFRESH_TOKEN_TTL_SECONDS,
  );

  // Set HTTP-only refresh cookie
  setRefreshTokenCookie(res, refreshToken);

  logger.info({ userId: user.id }, 'New user registered');

  return {
    success: true as const,
    data: {
      user: buildPublicUser(user),
      accessToken,
    },
  };
}

export async function login(input: LoginInput, res: Response) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      level: true,
      activePoints: true,
      bio: true,
      avatarUrl: true,
      isEmailVerified: true,
      createdAt: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return { success: false as const, code: 'INVALID_CREDENTIALS', error: 'Invalid email or password' };
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    logger.warn({ userId: user.id }, 'Failed login attempt');
    return { success: false as const, code: 'INVALID_CREDENTIALS', error: 'Invalid email or password' };
  }

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user.id, role: user.role, level: user.level });
  const { token: refreshToken, tokenId } = generateRefreshToken(user.id);

  // Store in Redis (multi-device: don't clear other sessions)
  await redis.set(
    refreshTokenRedisKey(user.id, tokenId),
    '1',
    'EX',
    REFRESH_TOKEN_TTL_SECONDS,
  );

  setRefreshTokenCookie(res, refreshToken);

  // Update last seen
  await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } }).catch(() => null);

  logger.info({ userId: user.id }, 'User logged in');

  const { passwordHash: _pw, isActive: _ia, ...publicUser } = user;

  return {
    success: true as const,
    data: {
      user: buildPublicUser(user),
      accessToken,
    },
  };
}

export async function refreshTokens(cookieToken: string, res: Response) {
  let payload: { userId: string; tokenId: string };

  try {
    payload = verifyRefreshToken(cookieToken) as { userId: string; tokenId: string };
  } catch {
    clearRefreshTokenCookie(res);
    return { success: false as const, code: 'INVALID_TOKEN', error: 'Invalid or expired refresh token' };
  }

  const redisKey = refreshTokenRedisKey(payload.userId, payload.tokenId);
  const stored = await redis.get(redisKey);

  if (!stored) {
    clearRefreshTokenCookie(res);
    return { success: false as const, code: 'TOKEN_REUSED', error: 'Refresh token has already been used or expired' };
  }

  // Invalidate old token (rotation)
  await redis.del(redisKey);

  // Fetch current user
  const user = await prisma.user.findUnique({
    where: { id: payload.userId, isActive: true },
    select: { id: true, role: true, level: true },
  });

  if (!user) {
    clearRefreshTokenCookie(res);
    return { success: false as const, code: 'USER_NOT_FOUND', error: 'User not found or inactive' };
  }

  // Issue new token pair
  const accessToken = generateAccessToken({ userId: user.id, role: user.role, level: user.level });
  const { token: newRefreshToken, tokenId: newTokenId } = generateRefreshToken(user.id);

  await redis.set(
    refreshTokenRedisKey(user.id, newTokenId),
    '1',
    'EX',
    REFRESH_TOKEN_TTL_SECONDS,
  );

  setRefreshTokenCookie(res, newRefreshToken);

  return { success: true as const, data: { accessToken } };
}

export async function logout(userId: string, cookieToken: string | undefined, res: Response) {
  // Invalidate the current refresh token if present
  if (cookieToken) {
    try {
      const payload = verifyRefreshToken(cookieToken) as { userId: string; tokenId: string };
      await redis.del(refreshTokenRedisKey(payload.userId, payload.tokenId));
    } catch {
      // Token already invalid — that's fine
    }
  }

  clearRefreshTokenCookie(res);
  logger.info({ userId }, 'User logged out');
  return { success: true as const, data: { message: 'Logged out successfully' } };
}

export async function logoutAll(userId: string, res: Response) {
  // Delete all refresh tokens for this user from Redis
  const pattern = refreshTokenRedisKey(userId, '*');
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }

  clearRefreshTokenCookie(res);
  logger.info({ userId }, 'User logged out from all devices');
  return { success: true as const, data: { message: 'Logged out from all devices' } };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId, isActive: true },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      level: true,
      memberType: true,
      activePoints: true,
      pendingPoints: true,
      bio: true,
      avatarUrl: true,
      isEmailVerified: true,
      createdAt: true,
      fieldExpertProfile: {
        select: { id: true, approvedField: true, institution: true, designation: true, isApproved: true },
      },
    },
  });

  if (!user) {
    return { success: false as const, code: 'USER_NOT_FOUND', error: 'User not found' };
  }

  return { success: true as const, data: { user } };
}
