// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Auth Store (Zustand v5)
//
// Access token: held in Zustand memory only (never localStorage, never cookie)
// Refresh token: HTTP-only cookie (managed by backend)
// Silent refresh: on app mount, attempts cookie-based refresh transparently
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { apiClient, setApiToken, ApiError } from '../lib/api-client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  level: string;
  memberType: string;
  activePoints: number;
  pendingPoints: number;
  bio: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  fieldExpertProfile: {
    id: string;
    approvedField: string;
    institution: string;
    designation: string;
    isApproved: boolean;
  } | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; username: string }) => Promise<void>;
  logout: () => Promise<void>;
  silentRefresh: () => Promise<boolean>;
  refreshMe: () => Promise<void>;
  setTokenAndUser: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isInitialized: false,

  setTokenAndUser: (token: string, user: AuthUser) => {
    setApiToken(token);
    set({ user, accessToken: token });
  },

  clearAuth: () => {
    setApiToken(null);
    set({ user: null, accessToken: null });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post<{ success: true; data: { user: AuthUser; accessToken: string } }>(
        '/auth/login',
        { email, password },
      );
      get().setTokenAndUser(res.data.accessToken, res.data.user);
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post<{ success: true; data: { user: AuthUser; accessToken: string } }>(
        '/auth/register',
        data,
      );
      get().setTokenAndUser(res.data.accessToken, res.data.user);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Even if logout API fails, clear local state
    }
    get().clearAuth();
  },

  silentRefresh: async (): Promise<boolean> => {
    try {
      const res = await apiClient.post<{ success: true; data: { accessToken: string } }>('/auth/refresh');
      setApiToken(res.data.accessToken);
      set({ accessToken: res.data.accessToken });

      // Fetch full user profile
      const meRes = await apiClient.get<{ success: true; data: { user: AuthUser } }>('/auth/me');
      set({ user: meRes.data.user });

      return true;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.code === 'TOKEN_REUSED')) {
        get().clearAuth();
      }
      return false;
    }
  },

  refreshMe: async () => {
    try {
      const res = await apiClient.get<{ success: true; data: { user: AuthUser } }>('/auth/me');
      set({ user: res.data.user });
    } catch {
      // Silent fail — user stays as-is
    }
  },
}));
