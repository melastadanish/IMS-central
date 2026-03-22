// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — API Entry Point
// ─────────────────────────────────────────────────────────────────────────────

import 'dotenv/config';
import { createApp } from './app.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { getRedis } from './lib/redis.js';
import { startScheduler } from './jobs/scheduler.js';

const PORT = Number(process.env['PORT'] ?? 3001);

async function start() {
  // Verify DB connectivity (non-fatal in dev — allows preview without DB)
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (err) {
    logger.warn({ err }, 'Database connection failed — running without DB (mock mode)');
  }

  // Verify Redis connectivity (non-fatal in dev)
  try {
    await getRedis().ping();
    logger.info('Redis connected');
  } catch (err) {
    logger.warn({ err }, 'Redis connection failed — running without cache');
  }

  const app = createApp();

  // Start job scheduler only when DB is available
  try {
    startScheduler();
  } catch (err) {
    logger.warn({ err }, 'Scheduler not started — DB unavailable');
  }

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
  try { getRedis().disconnect(); } catch { /* ignore */ }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
