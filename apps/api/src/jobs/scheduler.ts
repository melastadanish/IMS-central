// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Job Scheduler
// Registers cron jobs and Bull queue processors
// ─────────────────────────────────────────────────────────────────────────────

import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { newsScrapeQueue, aiSummaryQueue, aiTagQueue } from '../lib/queue.js';
import { processScrapeJob } from './scrapeNews.js';
import { processAiSummaryJob, processAiTagJob } from './aiSummary.js';
import { processExpiredPoints } from './pointsExpiry.js';

// ── Register Bull queue processors ───────────────────────────────────────────

export function registerQueueProcessors(): void {
  newsScrapeQueue.process(2, processScrapeJob);   // 2 concurrent scrape jobs
  aiSummaryQueue.process(3, processAiSummaryJob); // 3 concurrent AI jobs
  aiTagQueue.process(3, processAiTagJob);

  logger.info('Queue processors registered');
}

// ── Schedule cron jobs ────────────────────────────────────────────────────────

export function registerCronJobs(): void {
  const scrapeInterval = Number(process.env['SCRAPE_INTERVAL_MINUTES'] ?? '60');
  const enableScraping = process.env['ENABLE_NEWS_SCRAPING'] !== 'false';

  if (enableScraping) {
    // Queue all active sources for scraping on interval
    cron.schedule(`*/${scrapeInterval} * * * *`, async () => {
      try {
        const sources = await prisma.newsSource.findMany({
          where: { isActive: true },
          select: { id: true, slug: true },
        });

        for (const source of sources) {
          await newsScrapeQueue.add(
            { sourceId: source.id, sourceSlug: source.slug },
            { jobId: `scrape-${source.slug}-${Date.now()}` },
          );
        }

        logger.info({ sourceCount: sources.length }, 'Scheduled scrape jobs');
      } catch (err) {
        logger.error({ err }, 'Failed to schedule scrape jobs');
      }
    });

    logger.info({ intervalMinutes: scrapeInterval }, 'News scraping cron registered');
  }

  // Retry failed AI summaries every hour
  cron.schedule('5 * * * *', async () => {
    try {
      const failed = await prisma.newsStory.findMany({
        where: { summaryStatus: 'FAILED' },
        select: { id: true },
        take: 20,
      });

      for (const story of failed) {
        await aiSummaryQueue.add({ storyId: story.id }, { delay: 5_000 });
      }

      if (failed.length > 0) {
        logger.info({ count: failed.length }, 'Retrying failed AI summaries');
      }
    } catch (err) {
      logger.error({ err }, 'Failed to schedule AI summary retries');
    }
  });

  // Points expiry — runs at 00:01 daily
  cron.schedule('1 0 * * *', async () => {
    try {
      await processExpiredPoints();
    } catch (err) {
      logger.error({ err }, 'Points expiry job failed');
    }
  });

  logger.info('Cron jobs registered');
}

export function startScheduler(): void {
  registerQueueProcessors();
  registerCronJobs();
}
