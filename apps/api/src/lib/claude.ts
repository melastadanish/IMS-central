// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Anthropic Claude Client
//
// All AI calls use the universal error handling pattern:
//   - Wrap every call in try/catch
//   - On failure: log error, return empty string
//   - NEVER throw, NEVER block the caller
//   - Caller sets summaryStatus = 'FAILED' if result is empty string
// ─────────────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { logger } from './logger.js';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1024;
const TIMEOUT_MS = 30_000;

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
  _client = new Anthropic({ apiKey, timeout: TIMEOUT_MS, maxRetries: 3 });
  return _client;
}

// ── Universal call wrapper ────────────────────────────────────────────────────

async function callClaude(
  prompt: string,
  systemPrompt: string,
  maxTokens = MAX_TOKENS,
): Promise<string> {
  try {
    const client = getClient();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = response.content[0];
    return block?.type === 'text' ? block.text : '';
  } catch (error) {
    logger.error({ error }, 'Claude API call failed');
    return ''; // Always return empty string — never throw
  }
}

// ── AI Services ───────────────────────────────────────────────────────────────

/**
 * Synthesize a neutral, factual summary from multiple news source excerpts.
 * Returns empty string on failure — caller sets summaryStatus = 'FAILED'.
 */
export async function generateNewsSummary(
  storyTitle: string,
  sources: { sourceName: string; excerpt: string }[],
): Promise<string> {
  const sourceText = sources
    .map((s, i) => `Source ${i + 1} (${s.sourceName}):\n${s.excerpt}`)
    .join('\n\n');

  const prompt = `Story title: "${storyTitle}"\n\n${sourceText}`;

  return callClaude(
    prompt,
    `You are a neutral news summarizer for IMS News Central.
Synthesize the provided source excerpts into one factual, neutral summary.
- Do not include opinion or bias
- Do not attribute claims to specific sources
- Maximum 150 words
- Write in third person, present tense where applicable
- Do not begin with "This article" or "According to"`,
    300,
  );
}

/**
 * Convert an academic abstract into plain language.
 * Returns { simplified: '', keyFindings: [] } on failure.
 */
export async function simplifyAbstract(
  originalAbstract: string,
  field: string,
): Promise<{ simplified: string; keyFindings: string[] }> {
  const prompt = `Field: ${field}\n\nAbstract:\n${originalAbstract}`;

  const result = await callClaude(
    prompt,
    `You are an academic translator for IMS News Central's Knowledge Library.
Convert the academic abstract into plain language for an educated non-specialist.
Respond with valid JSON in this exact format:
{
  "simplified": "plain language summary (max 100 words)",
  "keyFindings": ["finding 1", "finding 2", "finding 3"]
}
Extract exactly 3 key findings as bullet points.
Do not include any text outside the JSON object.`,
    500,
  );

  if (!result) return { simplified: '', keyFindings: [] };

  try {
    const parsed = JSON.parse(result) as { simplified: string; keyFindings: string[] };
    return {
      simplified: parsed.simplified ?? '',
      keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
    };
  } catch {
    logger.warn({ result }, 'Failed to parse Claude JSON response for abstract simplification');
    return { simplified: '', keyFindings: [] };
  }
}

/**
 * Suggest topic tags and country codes for a news story.
 * Returns { countries: [], topics: [] } on failure.
 * Results are saved as unconfirmed — editors must confirm before publication.
 */
export async function suggestTags(
  headline: string,
  content: string,
): Promise<{ countries: string[]; topics: string[] }> {
  const prompt = `Headline: "${headline}"\n\nContent excerpt:\n${content.slice(0, 2000)}`;

  const result = await callClaude(
    prompt,
    `You are a news classifier for IMS News Central.
Analyze the headline and content. Return JSON with:
- "countries": array of ISO 3166-1 alpha-2 codes (e.g. ["US", "GB", "PK"])
- "topics": array of topic slugs from this list: ["geopolitics", "economics", "technology", "society", "religion", "environment", "security", "culture"]

Respond with valid JSON only. No explanation outside the JSON.
Example: {"countries": ["US", "PK"], "topics": ["geopolitics", "security"]}`,
    300,
  );

  if (!result) return { countries: [], topics: [] };

  try {
    const parsed = JSON.parse(result) as { countries: string[]; topics: string[] };
    return {
      countries: Array.isArray(parsed.countries) ? parsed.countries : [],
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
    };
  } catch {
    return { countries: [], topics: [] };
  }
}

/**
 * Generate a monthly growth analysis report for a member.
 * Returns empty string if insufficient data or on failure.
 * Reports are stored in DB and not regenerated on view.
 */
export async function analyzeMemberGrowth(
  memberName: string,
  comments: { content: string; createdAt: string; isVerified: boolean }[],
): Promise<string> {
  if (comments.length < 3) return ''; // Not enough data

  const commentSummary = comments
    .slice(-20) // Last 20 comments for context
    .map(
      (c, i) =>
        `[${new Date(c.createdAt).toLocaleDateString()} ${c.isVerified ? '(verified)' : ''}]\n${c.content.slice(0, 200)}`,
    )
    .join('\n\n---\n\n');

  return callClaude(
    `Member: ${memberName}\n\nRecent comments (chronological):\n\n${commentSummary}`,
    `You are an intellectual development analyst for IMS News Central.
Analyze this member's comment history and write a concise growth report.
Focus on:
1. Trend in analytical depth and writing quality
2. Topic consistency and expertise development
3. Critical thinking patterns
4. Any notable improvement or regression

Keep the tone supportive and constructive.
Flag (softly) if written work quality significantly outpaces what you'd expect from in-person explanation.
Maximum 300 words.`,
    600,
  );
}
