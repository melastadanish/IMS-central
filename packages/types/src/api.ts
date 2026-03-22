// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — API Response Types
// All API endpoints return one of these shapes.
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code: string; // Machine-readable: 'UNAUTHORIZED', 'NOT_FOUND', 'INVALID_STATE', etc.
  details?: unknown;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ── Common error codes ────────────────────────────────────────────────────────

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INVALID_STATE: 'INVALID_STATE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  FIELD_BOUNDARY_VIOLATION: 'FIELD_BOUNDARY_VIOLATION',
  CAPACITY_FULL: 'CAPACITY_FULL',
  VIDEO_NOT_READY: 'VIDEO_NOT_READY',
  ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
  AI_FAILED: 'AI_FAILED',
  INTERNAL: 'INTERNAL',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
