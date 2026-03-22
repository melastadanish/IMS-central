'use client';

// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Video Player Component
//
// Security:
//   - Never stores embed URL — always fetches signed URL from backend
//   - Bunny tokens auto-refresh before 6h expiry
//   - YouTube always uses nocookie domain
//   - External embeds get additional sandbox restrictions
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, ApiError } from '../lib/api-client';

interface PlayerUrlResponse {
  success: true;
  data: {
    type: 'BUNNY' | 'YOUTUBE' | 'VIMEO' | 'DAILYMOTION' | 'OTHER';
    embedUrl: string;
    expiresAt?: string; // ISO string, only for Bunny
  };
}

interface VideoPlayerProps {
  videoId: string;
  title: string;
  aspectRatio?: '16/9' | '4/3';
}

const REFRESH_BUFFER_MS = 30 * 60 * 1000; // Refresh 30 min before expiry

export function VideoPlayer({ videoId, title, aspectRatio = '16/9' }: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [embedType, setEmbedType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPlayerUrl = useCallback(async () => {
    try {
      const res = await apiClient.get<PlayerUrlResponse>(`/videos/${videoId}/player-url`);
      setEmbedUrl(res.data.embedUrl);
      setEmbedType(res.data.type);
      setError(null);

      // Schedule token refresh for Bunny videos
      if (res.data.type === 'BUNNY' && res.data.expiresAt) {
        const expiresAt = new Date(res.data.expiresAt).getTime();
        const refreshAt = expiresAt - REFRESH_BUFFER_MS;
        const delay = Math.max(refreshAt - Date.now(), 60_000); // At least 1 min

        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = setTimeout(() => {
          fetchPlayerUrl();
        }, delay);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Sign in to watch this video');
      } else if (err instanceof ApiError && err.status === 400) {
        setError('This video is still being processed. Check back soon.');
      } else {
        setError('Unable to load video player');
      }
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchPlayerUrl();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [fetchPlayerUrl]);

  const isBunny = embedType === 'BUNNY';
  // External embeds get stricter sandbox — Bunny does not need it (their own CDN)
  const sandboxAttr = isBunny
    ? undefined
    : 'allow-scripts allow-same-origin allow-presentation';

  const paddingTop = aspectRatio === '16/9' ? '56.25%' : '75%';

  if (isLoading) {
    return (
      <div
        className="relative bg-gray-100 rounded-xl overflow-hidden"
        style={{ paddingTop }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative bg-gray-100 rounded-xl overflow-hidden"
        style={{ paddingTop }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!embedUrl) return null;

  return (
    <div className="relative rounded-xl overflow-hidden bg-black" style={{ paddingTop }}>
      <iframe
        className="absolute inset-0 w-full h-full"
        src={embedUrl}
        title={title}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        {...(sandboxAttr ? { sandbox: sandboxAttr } : {})}
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
