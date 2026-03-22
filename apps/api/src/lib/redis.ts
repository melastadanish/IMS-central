// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Redis Client (Upstash)
// ─────────────────────────────────────────────────────────────────────────────

import Redis from 'ioredis';

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;

  const url = process.env['UPSTASH_REDIS_REST_URL'];
  const token = process.env['UPSTASH_REDIS_REST_TOKEN'];

  if (url && token) {
    // Upstash REST-compatible connection via ioredis
    // Upstash provides a standard Redis-compatible endpoint
    const redisUrl = url.replace('https://', `rediss://default:${token}@`);
    _redis = new Redis(redisUrl, {
      tls: {},
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });
  } else {
    // Local development fallback
    _redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });
  }

  _redis.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  return _redis;
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  const value = await redis.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const redis = getRedis();
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function cacheDelete(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key);
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  const redis = getRedis();
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// ── Cache TTLs (seconds) ──────────────────────────────────────────────────────

export const CACHE_TTL = {
  NEWS_STORY: 5 * 60,           // 5 min
  NEWS_FEED: 5 * 60,            // 5 min
  NEWS_TRENDING: 10 * 60,       // 10 min
  KNOWLEDGE_TOPIC: 60 * 60,     // 1 hour
  USER_PROFILE: 5 * 60,         // 5 min
  USER_POINTS: 60,              // 1 min
  COUNTRY_POLICY: 15 * 60,      // 15 min
  TOPIC_LIST: 60 * 60,          // 1 hour
  COUNTRY_LIST: 60 * 60,        // 1 hour
} as const;
