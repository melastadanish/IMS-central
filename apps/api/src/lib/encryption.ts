// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — AES-256-GCM Column Encryption
//
// Used for: meeting links, leader notes, CV paths, paper feedback,
//           application statements, and all other sensitive DB columns.
//
// Format:  "iv_hex:authTag_hex:encrypted_hex"  (all hex-encoded)
// GCM mode provides authentication — prevents tampering.
// Each call generates a unique random IV — same plaintext → different ciphertext.
//
// CRITICAL: If DATABASE_ENCRYPTION_KEY is lost, all encrypted data is gone.
// ─────────────────────────────────────────────────────────────────────────────

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes = 128 bits
const TAG_LENGTH = 16; // 16 bytes GCM auth tag
const KEY_LENGTH = 32; // 32 bytes = 256 bits

const AAD = Buffer.from('ims-news-central'); // Additional authenticated data

function getKey(): Buffer {
  const key = process.env['DATABASE_ENCRYPTION_KEY'];
  if (!key) {
    throw new Error('DATABASE_ENCRYPTION_KEY environment variable is not set');
  }
  if (key.length !== 64) {
    throw new Error(
      `DATABASE_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). Got ${key.length}.`,
    );
  }
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a UTF-8 string.
 * Returns the encrypted string in "iv:authTag:data" format (all hex).
 * Returns the original value unchanged if it is falsy (null/empty).
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(AAD);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return [iv.toString('hex'), authTag.toString('hex'), encrypted].join(':');
}

/**
 * Decrypt a string produced by encrypt().
 * Returns the original value unchanged if it is falsy or not in encrypted format.
 * Throws on decryption failure (wrong key or tampered data).
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return encryptedData;

  // Graceful handling of unencrypted legacy values
  if (!encryptedData.includes(':')) return encryptedData;

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format — expected "iv:authTag:data"');
  }

  const [ivHex, authTagHex, encrypted] = parts as [string, string, string];

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Malformed encrypted data — one or more segments are empty');
  }

  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAAD(AAD);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypt a JSON-serializable object.
 */
export function encryptJSON(data: object): string {
  return encrypt(JSON.stringify(data));
}

/**
 * Decrypt back to a typed object.
 * Caller is responsible for ensuring the type matches.
 */
export function decryptJSON<T>(encryptedData: string): T {
  return JSON.parse(decrypt(encryptedData)) as T;
}

/**
 * Detect whether a value is already encrypted by this module.
 * Used during migration of existing plaintext data.
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(':');
  if (parts.length !== 3) return false;
  const [iv, tag] = parts;
  // IV hex = 32 chars, authTag hex = 32 chars
  return (iv?.length === 32 && tag?.length === 32) ?? false;
}

/**
 * Generate a new 256-bit encryption key.
 * Run once and store as DATABASE_ENCRYPTION_KEY.
 * Usage: node -e "import('./src/lib/encryption.js').then(m => console.log(m.generateKey()))"
 */
export function generateKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

// ── Key rotation helper ────────────────────────────────────────────────────────
// Re-encrypt a value from an old key to the current key.
// Used by scripts/rotate-key.ts

export function reEncrypt(encryptedValue: string, oldKeyHex: string): string {
  if (!isEncrypted(encryptedValue)) return encryptedValue;

  const oldKey = Buffer.from(oldKeyHex, 'hex');
  const parts = encryptedValue.split(':') as [string, string, string];
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const data = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, oldKey, iv);
  decipher.setAAD(AAD);
  decipher.setAuthTag(authTag);

  let plaintext = decipher.update(data, 'hex', 'utf8');
  plaintext += decipher.final('utf8');

  return encrypt(plaintext);
}
