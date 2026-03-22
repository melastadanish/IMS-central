# IMS News Central — Developer Guide

## Quick Start

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed the database
pnpm db:seed

# Start development (both apps)
pnpm dev
```

## Architecture

**Monorepo:** Turborepo + pnpm workspaces
- `apps/api` — Express.js backend (port 3001)
- `apps/web` — Next.js 15 frontend (port 3000)
- `packages/types` — Shared TypeScript enums and DTOs
- `packages/utils` — Shared pure utilities
- `prisma/` — Schema + seed file

## Three Non-Negotiable Invariants

1. **`pendingPoints` and `activePoints` are always separate** — different `User` columns, never combined
2. **Comment checkmark (`OPINION_VERIFIED`) requires BOTH `fieldExpertApproverId` AND `leaderApproverId`** — two independent approvers
3. **60-day expiry is per-batch** — each `PendingPointExpiry` row has its own `expiresAt` clock

## Security Rules

- `ANTHROPIC_API_KEY` lives in Supabase Vault in production — never `NEXT_PUBLIC_`
- `SUPABASE_SERVICE_KEY` server-side only — never in any client bundle
- Access tokens: Zustand memory only — never localStorage
- Refresh tokens: HTTP-only cookie path `/api/v1/auth` only
- Meeting links, leader notes, CV paths: encrypted before every DB INSERT
- Field expert boundary: enforced in `validateFieldBoundary` middleware AND in `comments.service.ts`
- All private file access via signed URLs (1hr max) — never raw storage paths
- YouTube always uses `youtube-nocookie.com`
- Bunny token auth must be enabled in library settings before go-live

## Key Files

| File | Purpose |
|------|---------|
| `apps/api/src/lib/encryption.ts` | AES-256-GCM column encryption |
| `apps/api/src/lib/jwt.ts` | JWT generation + HTTP-only cookie |
| `apps/api/src/middleware/authenticate.ts` | JWT auth middleware |
| `apps/api/src/middleware/requireRole.ts` | RBAC + field boundary validation |
| `apps/api/src/services/comments.service.ts` | Comment state machine + dual approval |
| `apps/api/src/services/presentations.service.ts` | Presentation flow + activate/wipe points |
| `apps/api/src/services/bunny-stream.service.ts` | Bunny Stream CDN integration |
| `apps/api/src/jobs/pointsExpiry.ts` | 60-day expiry cron (runs 00:01 daily) |
| `apps/web/src/stores/auth.store.ts` | Zustand auth store (token in memory) |
| `scripts/rotate-key.ts` | Encryption key rotation utility |

## Seed Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ims-central.com | Admin@IMS2024! |
| Leader | leader.ahmad@ims-central.com | Leader@IMS2024! |
| Editor | editor.omar@ims-central.com | Editor@IMS2024! |
| Field Expert (geopolitics) | expert.yusuf@ims-central.com | Expert@IMS2024! |
| Field Expert (economics) | expert.mariam@ims-central.com | Expert@IMS2024! |
| Member | member.hassan@ims-central.com | Member@IMS2024! |

## Comment State Machine

```
PENDING_EDITOR → PUBLISHED / REJECTED_EDITOR
PUBLISHED → PENDING_OPINION_REVIEW  (member clicks "Request Opinion Points")
PENDING_OPINION_REVIEW → OPINION_EXPERT_APPROVED / OPINION_REJECTED
OPINION_EXPERT_APPROVED → OPINION_VERIFIED (both FKs set) / OPINION_REJECTED
```

## Presentation Flow

```
PENDING → [Day 5] RE_REQUESTED → [Day 10] ESCALATED → SCHEDULED
SCHEDULED → COMPLETED → APPROVED → activate ALL pending point batches
                      → CANCELLED → wipe ALL pending points + revert OPINION_VERIFIED comments
```

## Key Generation

```bash
# Generate DATABASE_ENCRYPTION_KEY
pnpm generate:key

# Generate JWT_SECRET / JWT_REFRESH_SECRET
pnpm generate:jwt

# Rotate encryption key (run with existing key in env)
pnpm tsx scripts/rotate-key.ts --new-key <new-64-char-hex>
```

## Design System

| Token | Value |
|-------|-------|
| Primary Blue | `#1B3A6B` |
| Accent Blue | `#2E75B6` |
| Light Blue | `#E8EEF7` |
| Success Green | `#16A34A` |
| Warning Amber | `#D97706` |
| Error Red | `#DC2626` |

CSS classes: `.text-primary`, `.bg-primary`, `.text-accent`, `.bg-light-blue`, `.ai-content`, `.verified-checkmark`, `.pending-points`, `.active-points`
