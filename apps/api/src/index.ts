// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — API Entry Point
// ─────────────────────────────────────────────────────────────────────────────

import 'dotenv/config';
import { createApp } from './app.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';
import { startScheduler } from './jobs/scheduler.js';

const PORT = Number(process.env['PORT'] ?? 3001);

async function start() {
  // Verify DB connectivity
  await prisma.$connect();
  logger.info('Database connected');

  // Verify Redis connectivity
  await redis.ping();
  logger.info('Redis connected');

  const app = createApp();

  // Start job scheduler (RSS scraping, AI processing, expiry cron)
  startScheduler();

  app.listen(PORT, () => {
    logger.info({ port: PORT }, `IMS API running on port ${PORT}`);
  });
}

start().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down...');
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
