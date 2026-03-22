// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — AI Summary + Tag Jobs
// Processes: aiSummaryQueue, aiTagQueue
// On failure: sets summaryStatus = 'FAILED', retried after 1 hour by cron
// ─────────────────────────────────────────────────────────────────────────────

import type Bull from 'bull';
import { prisma } from '../lib/prisma.js';
import { generateNewsSummary, suggestTags } from '../lib/claude.js';
import { logger } from '../lib/logger.js';

// ── AI Summary Job ────────────────────────────────────────────────────────────

export async function processAiSummaryJob(job: Bull.Job<{ storyId: string }>): Promise<void> {
  const { storyId } = job.data;

  const story = await prisma.newsStory.findUnique({
    where: { id: storyId },
    select: {
      id: true,
      headline: true,
      summaryStatus: true,
      sources: {
        select: {
          excerpt: true,
          source: { select: { name: true } },
        },
      },
    },
  });

  if (!story) {
    logger.warn({ storyId }, 'Story not found for AI summary');
    return;
  }

  if (story.summaryStatus === 'DONE') return; // Already summarized

  const sources = story.sources
    .filter((s) => s.excerpt?.length > 20)
    .map((s) => ({ sourceName: s.source.name, excerpt: s.excerpt }));

  if (sources.length === 0) {
    await prisma.newsStory.update({
      where: { id: storyId },
      data: { summaryStatus: 'FAILED' },
    });
    return;
  }

  const summary = await generateNewsSummary(story.headline, sources);

  await prisma.newsStory.update({
    where: { id: storyId },
    data: {
      summary: summary || null,
      summaryStatus: summary ? 'DONE' : 'FAILED',
    },
  });

  if (summary) {
    logger.info({ storyId }, 'AI summary generated');
  } else {
    logger.warn({ storyId }, 'AI summary generation failed — will retry');
  }
}

// ── AI Tag Job ────────────────────────────────────────────────────────────────

export async function processAiTagJob(job: Bull.Job<{ storyId: string }>): Promise<void> {
  const { storyId } = job.data;

  const story = await prisma.newsStory.findUnique({
    where: { id: storyId },
    select: {
      id: true,
      headline: true,
      tagsConfirmed: true,
      sources: { select: { excerpt: true } },
    },
  });

  if (!story) return;
  if (story.tagsConfirmed) return; // Don't overwrite editor-confirmed tags

  // Combine excerpts for context
  const content = story.sources.map((s) => s.excerpt).join('\n\n').slice(0, 2000);

  const { countries, topics } = await suggestTags(story.headline, content);

  if (countries.length === 0 && topics.length === 0) return;

  // Connect suggested country tags (unconfirmed)
  if (countries.length > 0) {
    const dbCountries = await prisma.country.findMany({
      where: { code: { in: countries } },
      select: { id: true },
    });

    if (dbCountries.length > 0) {
      await prisma.newsStory.update({
        where: { id: storyId },
        data: { countries: { connect: dbCountries.map((c) => ({ id: c.id })) } },
      });
    }
  }

  // Connect suggested topic tags (unconfirmed)
  if (topics.length > 0) {
    const dbTopic = await prisma.newsTopic.findFirst({
      where: { slug: { in: topics } },
      select: { id: true },
    });

    if (dbTopic) {
      await prisma.newsStory.update({
        where: { id: storyId },
        data: { topicId: dbTopic.id },
      });
    }
  }

  logger.info({ storyId, countries, topics }, 'AI tags suggested');
}
