// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — News Scrape Job
// Processes: newsScrapeQueue
// Pipeline: fetch RSS → normalize → dedup via canonicalHash → upsert → queue AI
// ─────────────────────────────────────────────────────────────────────────────

import RSSParser from 'rss-parser';
import { createHash } from 'crypto';
import type Bull from 'bull';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { aiSummaryQueue, aiTagQueue } from '../lib/queue.js';

const parser = new RSSParser({ timeout: 10_000 });

// ── Canonical hash (dedup key) ────────────────────────────────────────────────

function canonicalHash(title: string, date: Date): string {
  const normalizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim()
    .slice(0, 100);

  const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
  return createHash('sha256').update(`${normalizedTitle}:${dateStr}`).digest('hex');
}

// ── Slug generation ───────────────────────────────────────────────────────────

function generateStorySlug(title: string, date: Date): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80);

  const dateStr = date.toISOString().slice(0, 10);
  return `${base}-${dateStr}`;
}

// ── Excerpt extraction ────────────────────────────────────────────────────────

function extractExcerpt(item: RSSParser.Item): string {
  const raw =
    item.contentSnippet ??
    item.content ??
    item.summary ??
    '';

  // Strip HTML tags
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 800);
}

// ── Job processor ─────────────────────────────────────────────────────────────

export async function processScrapeJob(
  job: Bull.Job<{ sourceId: string; sourceSlug: string }>,
): Promise<void> {
  const { sourceId, sourceSlug } = job.data;

  const source = await prisma.newsSource.findUnique({
    where: { id: sourceId, isActive: true },
    select: { id: true, name: true, rssUrl: true },
  });

  if (!source?.rssUrl) {
    logger.warn({ sourceId }, 'News source not found or has no RSS URL');
    return;
  }

  logger.info({ source: sourceSlug }, 'Scraping RSS feed');

  let feed: RSSParser.Output<Record<string, unknown>>;
  try {
    feed = await parser.parseURL(source.rssUrl);
  } catch (err) {
    logger.error({ err, source: sourceSlug }, 'RSS fetch failed');
    throw err; // Let Bull retry
  }

  let newCount = 0;

  for (const item of feed.items.slice(0, 30)) {
    if (!item.title || !item.link) continue;

    const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
    const hash = canonicalHash(item.title, publishedAt);

    // Check if already exists
    const existing = await prisma.newsStory.findUnique({
      where: { canonicalHash: hash },
      select: { id: true },
    });

    if (existing) continue;

    const excerpt = extractExcerpt(item);
    const storySlug = generateStorySlug(item.title, publishedAt);

    try {
      // Create story with upsert (race condition safety)
      const story = await prisma.newsStory.create({
        data: {
          headline: item.title.trim(),
          slug: storySlug,
          canonicalHash: hash,
          summaryStatus: 'PENDING',
          publishedAt,
          isPublished: false, // Editors review before publishing
          viewCount: 0,
          sources: {
            create: {
              sourceId: source.id,
              originalUrl: item.link,
              excerpt,
            },
          },
        },
        select: { id: true },
      });

      newCount++;

      // Queue AI processing
      await aiSummaryQueue.add({ storyId: story.id }, { delay: 2_000 });
      await aiTagQueue.add({ storyId: story.id }, { delay: 5_000 });
    } catch (err: unknown) {
      // Unique constraint violation = duplicate hash, skip silently
      if ((err as { code?: string }).code === 'P2002') continue;
      logger.error({ err, headline: item.title }, 'Failed to create story');
    }
  }

  logger.info({ source: sourceSlug, newStories: newCount }, 'Scrape complete');
}
