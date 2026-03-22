// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — API Client
// Wraps fetch with base URL, auth header injection, and 401 handling
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token store — set by Zustand auth store, accessed here
let _accessToken: string | null = null;

export function setApiToken(token: string | null) {
  _accessToken = token;
}

export function getApiToken(): string | null {
  return _accessToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers,
    credentials: 'include', // Send HTTP-only refresh cookie
  });

  if (!response.ok) {
    let errorData: { error?: string; code?: string } = {};
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON error response
    }

    throw new ApiError(
      response.status,
      errorData.code ?? 'UNKNOWN_ERROR',
      errorData.error ?? `HTTP ${response.status}`,
    );
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// ── Typed request helpers ─────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
