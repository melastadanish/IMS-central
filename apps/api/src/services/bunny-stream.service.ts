// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Bunny Stream Service
//
// Security:
//   - BUNNY_STREAM_API_KEY never exposed to frontend
//   - Token auth: SHA256(tokenKey + libraryId + expires + videoId)
//   - All playback URLs are signed with 6h expiry
//   - Hotlink protection enforced at library level (Bunny dashboard)
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from 'crypto';
import { logger } from '../lib/logger.js';

const BUNNY_API_KEY = process.env['BUNNY_STREAM_API_KEY'] ?? '';
const BUNNY_LIBRARY_ID = Number(process.env['BUNNY_STREAM_LIBRARY_ID'] ?? 0);
const BUNNY_CDN_HOSTNAME = process.env['BUNNY_STREAM_CDN_HOSTNAME'] ?? '';
const BUNNY_TOKEN_KEY = process.env['BUNNY_STREAM_TOKEN_KEY'] ?? '';
const BUNNY_BASE_URL = process.env['BUNNY_STREAM_BASE_URL'] ?? 'https://video.bunnycdn.com';

const PLAYER_TOKEN_EXPIRY_SECONDS = 6 * 60 * 60; // 6 hours

// ── API helpers ───────────────────────────────────────────────────────────────

async function bunnyRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BUNNY_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      AccessKey: BUNNY_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'no body');
    throw new Error(`Bunny API error ${response.status}: ${text}`);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BunnyVideo {
  videoId: string;
  libraryId: number;
  title: string;
  status: number; // 0=Queued, 1=Processing, 2=Encoding, 3=Finished, 4=Resolution, 5=Failed, 6=Captions
  encodeProgress: number;
  length: number; // seconds
  thumbnailFileName: string;
  dateUploaded: string;
}

export interface BunnyCreateResult {
  videoId: string;
  libraryId: number;
}

export interface BunnyTusUploadHeaders {
  AuthorizationSignature: string;
  AuthorizationExpire: number;
  VideoId: string;
  LibraryId: string;
}

// ── Create video ──────────────────────────────────────────────────────────────

export async function createBunnyVideo(title: string): Promise<BunnyCreateResult> {
  const result = await bunnyRequest<{ guid: string; libraryId: number }>(
    `/library/${BUNNY_LIBRARY_ID}/videos`,
    {
      method: 'POST',
      body: JSON.stringify({ title }),
    },
  );

  logger.info({ videoId: result.guid, title }, 'Bunny video created');

  return { videoId: result.guid, libraryId: result.libraryId ?? BUNNY_LIBRARY_ID };
}

// ── Get video status ──────────────────────────────────────────────────────────

export async function getBunnyVideo(videoId: string): Promise<BunnyVideo> {
  return bunnyRequest<BunnyVideo>(`/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`);
}

// ── Delete video ──────────────────────────────────────────────────────────────

export async function deleteBunnyVideo(videoId: string): Promise<void> {
  await bunnyRequest<void>(`/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
    method: 'DELETE',
  });
  logger.info({ videoId }, 'Bunny video deleted');
}

// ── Generate TUS upload headers (for direct browser upload) ──────────────────
// Browser uploads directly to Bunny — IMS backend never receives the video file.

export function generateTusUploadHeaders(videoId: string): BunnyTusUploadHeaders {
  const expires = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24h

  // HMAC-SHA256(apiKey + libraryId + expires + videoId)
  const signature = createHash('sha256')
    .update(`${BUNNY_API_KEY}${BUNNY_LIBRARY_ID}${expires}${videoId}`)
    .digest('hex');

  return {
    AuthorizationSignature: signature,
    AuthorizationExpire: expires,
    VideoId: videoId,
    LibraryId: String(BUNNY_LIBRARY_ID),
  };
}

// ── TUS upload URL ────────────────────────────────────────────────────────────

export function getTusUploadUrl(videoId: string): string {
  return `https://video.bunnycdn.com/tusupload`;
}

// ── Generate signed player URL (6h expiry) ────────────────────────────────────

export interface SignedEmbedOptions {
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  captions?: boolean;
  seekTo?: number; // seconds
}

export function generateSignedEmbedUrl(videoId: string, options: SignedEmbedOptions = {}): string {
  if (!BUNNY_TOKEN_KEY) {
    logger.warn('BUNNY_STREAM_TOKEN_KEY not set — returning unsigned URL (development only)');
    return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
  }

  const expires = Math.floor(Date.now() / 1000) + PLAYER_TOKEN_EXPIRY_SECONDS;

  // Token: SHA256(tokenKey + libraryId + expires + videoId)
  const token = createHash('sha256')
    .update(`${BUNNY_TOKEN_KEY}${BUNNY_LIBRARY_ID}${expires}${videoId}`)
    .digest('hex');

  const params = new URLSearchParams({
    token,
    expires: String(expires),
    ...(options.autoPlay ? { autoplay: '1' } : {}),
    ...(options.loop ? { loop: '1' } : {}),
    ...(options.muted ? { muted: '1' } : {}),
    ...(options.captions ? { captions: '1' } : {}),
    ...(options.seekTo ? { t: String(options.seekTo) } : {}),
  });

  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?${params.toString()}`;
}

// ── Thumbnail URL ─────────────────────────────────────────────────────────────

export function getThumbnailUrl(videoId: string): string {
  return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/thumbnail.jpg`;
}

// ── Set custom thumbnail ──────────────────────────────────────────────────────

export async function setCustomThumbnail(videoId: string, imageBuffer: Buffer): Promise<void> {
  const url = `${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}/thumbnail`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'image/jpeg' },
    body: imageBuffer,
  });

  if (!response.ok) {
    throw new Error(`Failed to set thumbnail: ${response.status}`);
  }

  logger.info({ videoId }, 'Custom thumbnail set');
}

// ── List videos ───────────────────────────────────────────────────────────────

export async function listBunnyVideos(options: { page?: number; itemsPerPage?: number; search?: string } = {}): Promise<{
  totalItems: number;
  items: BunnyVideo[];
}> {
  const params = new URLSearchParams({
    page: String(options.page ?? 1),
    itemsPerPage: String(options.itemsPerPage ?? 100),
    ...(options.search ? { search: options.search } : {}),
  });

  return bunnyRequest(`/library/${BUNNY_LIBRARY_ID}/videos?${params.toString()}`);
}

// ── Verify webhook signature ──────────────────────────────────────────────────
// Bunny sends SHA256 of: (apiKey + videoId + libraryId + webhookTimestamp)

export function verifyBunnyWebhookSignature(
  videoId: string,
  libraryId: number,
  timestamp: string,
  receivedSignature: string,
): boolean {
  const expected = createHash('sha256')
    .update(`${BUNNY_API_KEY}${videoId}${libraryId}${timestamp}`)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  if (expected.length !== receivedSignature.length) return false;

  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ receivedSignature.charCodeAt(i);
  }

  return diff === 0;
}

// ── Bunny encoding status codes ────────────────────────────────────────────────

export function bunnyStatusToAppStatus(bunnyStatus: number): string {
  switch (bunnyStatus) {
    case 0: return 'PENDING';
    case 1:
    case 2: return 'PROCESSING';
    case 3:
    case 4: return 'READY';
    case 6: return 'READY'; // Captions added — still ready
    case 5: return 'FAILED';
    default: return 'PROCESSING';
  }
}
