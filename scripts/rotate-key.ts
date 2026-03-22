// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Encryption Key Rotation Script
//
// Usage: pnpm tsx scripts/rotate-key.ts --new-key <64-char-hex>
//
// ⚠️  CRITICAL WARNING:
//   - Run this in a transaction-safe manner with a database backup first
//   - If DATABASE_ENCRYPTION_KEY is lost, ALL encrypted data is UNRECOVERABLE
//   - This script re-encrypts all encrypted columns with the new key
//   - After rotation, immediately update DATABASE_ENCRYPTION_KEY in your env
//   - Test decryption with the new key before removing the old key
//
// Columns rotated:
//   User:                     phoneNumber
//   FieldExpert:              cvDocumentUrl, academicCredentials, publishedWorks
//   PresentationRequest:      meetingLink, leaderNote, cancellationReason, evidenceLink
//   PaperReviewSubmission:    paperFileUrl, feedbackReport
//   ResearchTeamApplication:  motivation, background
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const prisma = new PrismaClient();

// ── Encryption utilities with explicit key parameter ──────────────────────────

function encryptWithKey(plaintext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptWithKey(encryptedData: string, keyHex: string): string {
  const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':');
  if (!ivHex || !authTagHex || !encryptedHex) throw new Error('Invalid encrypted format');

  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
}

function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  return parts.length === 3 && parts[0]!.length === 32 && parts[1]!.length === 32;
}

function reEncrypt(encryptedValue: string, oldKey: string, newKey: string): string {
  if (!isEncrypted(encryptedValue)) return encryptedValue;
  const plaintext = decryptWithKey(encryptedValue, oldKey);
  return encryptWithKey(plaintext, newKey);
}

// ── Column definitions ────────────────────────────────────────────────────────

interface ColumnSpec {
  model: string;
  field: string;
  nullable: boolean;
}

const ENCRYPTED_COLUMNS: ColumnSpec[] = [
  { model: 'user', field: 'phoneNumber', nullable: true },
  { model: 'fieldExpert', field: 'cvDocumentUrl', nullable: true },
  { model: 'fieldExpert', field: 'academicCredentials', nullable: true },
  { model: 'fieldExpert', field: 'publishedWorks', nullable: true },
  { model: 'presentationRequest', field: 'meetingLink', nullable: true },
  { model: 'presentationRequest', field: 'leaderNote', nullable: true },
  { model: 'presentationRequest', field: 'cancellationReason', nullable: true },
  { model: 'presentationRequest', field: 'evidenceLink', nullable: true },
  { model: 'paperReviewSubmission', field: 'paperFileUrl', nullable: true },
  { model: 'paperReviewSubmission', field: 'feedbackReport', nullable: true },
  { model: 'researchTeamApplication', field: 'motivation', nullable: false },
  { model: 'researchTeamApplication', field: 'background', nullable: false },
];

// ── Main rotation logic ───────────────────────────────────────────────────────

async function rotateKey(oldKey: string, newKey: string) {
  if (oldKey.length !== 64) throw new Error('Old key must be 64 hex characters (32 bytes)');
  if (newKey.length !== 64) throw new Error('New key must be 64 hex characters (32 bytes)');

  console.log('🔐 Starting encryption key rotation...');
  console.log('⚠️  This will re-encrypt all encrypted columns. Take a database backup first!');
  console.log('');

  let totalUpdated = 0;

  for (const { model, field } of ENCRYPTED_COLUMNS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = (prisma as any)[model];
    if (!table) {
      console.warn(`  ⚠️ Model ${model} not found in Prisma client`);
      continue;
    }

    const records = await table.findMany({ select: { id: true, [field]: true } });
    let count = 0;

    for (const record of records) {
      const currentValue = record[field] as string | null;
      if (!currentValue || !isEncrypted(currentValue)) continue;

      try {
        const reEncrypted = reEncrypt(currentValue, oldKey, newKey);
        await table.update({ where: { id: record.id }, data: { [field]: reEncrypted } });
        count++;
      } catch (err) {
        console.error(`  ❌ Failed to re-encrypt ${model}.${field} for id=${record.id}:`, err);
        throw err; // Abort on first failure — do not partially rotate
      }
    }

    if (count > 0) {
      console.log(`  ✅ ${model}.${field}: ${count} record(s) re-encrypted`);
      totalUpdated += count;
    } else {
      console.log(`  ⬜ ${model}.${field}: no encrypted values found`);
    }
  }

  console.log('');
  console.log(`✅ Key rotation complete — ${totalUpdated} values re-encrypted`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Verify decryption works with the new key by testing a known value');
  console.log('  2. Update DATABASE_ENCRYPTION_KEY in your environment immediately');
  console.log('  3. Restart all API server instances to pick up the new key');
  console.log('  4. Delete the old key securely — do NOT store it anywhere');
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const newKeyIndex = args.indexOf('--new-key');

  if (newKeyIndex === -1 || !args[newKeyIndex + 1]) {
    console.error('Usage: tsx scripts/rotate-key.ts --new-key <64-char-hex>');
    console.error('');
    console.error('Generate a new key:');
    console.error('  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }

  const newKey = args[newKeyIndex + 1]!;
  const oldKey = process.env['DATABASE_ENCRYPTION_KEY'];

  if (!oldKey) {
    console.error('❌ DATABASE_ENCRYPTION_KEY environment variable is not set');
    process.exit(1);
  }

  if (oldKey === newKey) {
    console.error('❌ New key is identical to the current key — no rotation needed');
    process.exit(1);
  }

  await rotateKey(oldKey, newKey);
}

main()
  .catch((err) => {
    console.error('❌ Key rotation failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
