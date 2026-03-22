// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Pino Structured Logging
// Masks sensitive fields — emails and IDs are never logged in plain.
// ─────────────────────────────────────────────────────────────────────────────

import pino from 'pino';

const isDev = process.env['NODE_ENV'] !== 'production';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
      }
    : undefined,
  redact: {
    // Mask sensitive fields in log output
    paths: [
      'email',
      '*.email',
      'password',
      '*.password',
      'passwordHash',
      '*.passwordHash',
      'accessToken',
      '*.accessToken',
      'refreshToken',
      '*.refreshToken',
      'apiKey',
      '*.apiKey',
      'meetingLink',
      '*.meetingLink',
    ],
    censor: '[REDACTED]',
  },
});
