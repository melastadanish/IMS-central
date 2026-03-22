// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Password Hashing
// bcrypt with 12 salt rounds (~300ms per hash — slow enough to resist brute force).
// ─────────────────────────────────────────────────────────────────────────────

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export interface PasswordStrengthResult {
  valid: boolean;
  reason?: string;
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number' };
  }
  return { valid: true };
}
