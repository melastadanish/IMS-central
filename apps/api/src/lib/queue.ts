// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Bull Queue Setup (Upstash Redis-backed)
// ─────────────────────────────────────────────────────────────────────────────

import Bull from 'bull';
import { logger } from './logger.js';

const REDIS_URL = process.env['UPSTASH_REDIS_REST_URL'] ?? 'redis://localhost:6379';

// Parse Upstash REST URL into a redis connection string if needed.
// Upstash provides a REST URL (https://xxx.upstash.io) but Bull needs
// a standard Redis connection. In production use Upstash Redis with
// a standard Redis connection string (rediss://...).
function getRedisConfig(): Bull.QueueOptions['redis'] {
  const url = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
  return url as unknown as Bull.QueueOptions['redis'];
}

// ── Queue definitions ─────────────────────────────────────────────────────────

export const newsScrapeQueue = new Bull<{ sourceId: string; sourceSlug: string }>('news-scrape', {
  redis: getRedisConfig(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30_000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

export const aiSummaryQueue = new Bull<{ storyId: string }>('ai-summary', {
  redis: getRedisConfig(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 60_000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

export const aiTagQueue = new Bull<{ storyId: string }>('ai-tag', {
  redis: getRedisConfig(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 60_000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

// ── Queue event logging ───────────────────────────────────────────────────────

function attachLogging(queue: Bull.Queue, name: string) {
  queue.on('failed', (job, err) => {
    logger.error({ jobId: job.id, queue: name, err }, 'Job failed');
  });
  queue.on('stalled', (job) => {
    logger.warn({ jobId: job.id, queue: name }, 'Job stalled');
  });
}

attachLogging(newsScrapeQueue, 'news-scrape');
attachLogging(aiSummaryQueue, 'ai-summary');
attachLogging(aiTagQueue, 'ai-tag');
