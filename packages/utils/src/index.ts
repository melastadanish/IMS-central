// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Shared Utilities
// Pure functions with no framework dependencies.
// ─────────────────────────────────────────────────────────────────────────────

// ── String utilities ──────────────────────────────────────────────────────────

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// ── Date utilities ────────────────────────────────────────────────────────────

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

export function isExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt;
}

// ── Points utilities ──────────────────────────────────────────────────────────

// Level progression thresholds (in active points)
export const LEVEL_THRESHOLDS = {
  OPINION_LEADER: 100,    // Member → Opinion Leader
  COMMUNITY_EXPERT: 300,  // Opinion Leader → Community Expert
} as const;

export function getNextLevelThreshold(activePoints: number): number | null {
  if (activePoints < LEVEL_THRESHOLDS.OPINION_LEADER) {
    return LEVEL_THRESHOLDS.OPINION_LEADER;
  }
  if (activePoints < LEVEL_THRESHOLDS.COMMUNITY_EXPERT) {
    return LEVEL_THRESHOLDS.COMMUNITY_EXPERT;
  }
  return null; // Already at max level
}

export function calculateLevelFromPoints(activePoints: number): string {
  if (activePoints >= LEVEL_THRESHOLDS.COMMUNITY_EXPERT) return 'COMMUNITY_EXPERT';
  if (activePoints >= LEVEL_THRESHOLDS.OPINION_LEADER) return 'OPINION_LEADER';
  return 'MEMBER';
}

// ── Video utilities ───────────────────────────────────────────────────────────

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube-nocookie\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(url);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function extractVimeoId(url: string): string | null {
  const match = /vimeo\.com\/(\d+)/.exec(url);
  return match?.[1] ?? null;
}

export function detectEmbedType(url: string): { type: string; id: string | null } {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return { type: 'YOUTUBE', id: extractYouTubeId(url) };
  }
  if (url.includes('vimeo.com')) {
    return { type: 'VIMEO', id: extractVimeoId(url) };
  }
  if (url.includes('dailymotion.com')) {
    const match = /dailymotion\.com\/video\/([^_?]+)/.exec(url);
    return { type: 'DAILYMOTION', id: match?.[1] ?? null };
  }
  return { type: 'DIRECT_URL', id: null };
}

// ── News utilities ────────────────────────────────────────────────────────────

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Validation utilities ──────────────────────────────────────────────────────

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isMeetingUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;
  const meetingDomains = [
    'zoom.us', 'meet.google.com', 'teams.microsoft.com',
    'whereby.com', 'webex.com', 'gotomeeting.com',
  ];
  const parsed = new URL(url);
  return meetingDomains.some((domain) => parsed.hostname.includes(domain)) ||
    url.startsWith('https://'); // Allow any HTTPS URL for "other" platforms
}
