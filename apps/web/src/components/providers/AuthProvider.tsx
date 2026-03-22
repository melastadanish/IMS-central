'use client';

// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Auth Provider
// On mount: attempts silent refresh via HTTP-only cookie
// Transparent re-login — user never sees loading if token is valid
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/auth.store';

const REFRESH_INTERVAL_MS = 13 * 60 * 1000; // 13 minutes (access token is 15m)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { silentRefresh, accessToken } = useAuthStore();
  const initialized = useRef(false);

  // Silent refresh on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    silentRefresh().finally(() => {
      useAuthStore.setState({ isInitialized: true });
    });
  }, [silentRefresh]);

  // Proactive token refresh before expiry
  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(() => {
      silentRefresh();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [accessToken, silentRefresh]);

  return <>{children}</>;
}
