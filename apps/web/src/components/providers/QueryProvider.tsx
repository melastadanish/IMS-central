'use client';

// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — TanStack Query Provider
// Configures global query client with 401 → logout behavior
// ─────────────────────────────────────────────────────────────────────────────

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { ApiError } from '../../lib/api-client';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000, // 1 min
        retry: (failureCount, error) => {
          // Don't retry auth errors
          if (error instanceof ApiError && error.status === 401) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        onError: (error) => {
          if (error instanceof ApiError && error.status === 401) {
            useAuthStore.getState().clearAuth();
          }
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new client
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
