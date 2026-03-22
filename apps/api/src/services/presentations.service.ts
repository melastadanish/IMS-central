// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Presentations Service
//
// Flow:
//   PENDING → [Day 5] → RE_REQUESTED → [Day 10] → ESCALATED → SCHEDULED
//   SCHEDULED → COMPLETED → APPROVED (activate all pending points)
//                        → CANCELLED (wipe all pending points)
//
// Security: Meeting links encrypted before DB insert, decrypted on authorized request
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { encrypt, decrypt } from '../lib/encryption.js';
import { sendEmail } from '../lib/email.js';
import { MEETING_PLATFORMS } from './presentations.types.js';

const MEETING_LINK_MAX_AGE_HOURS = Number(process.env['MEETING_LINK_MAX_AGE_HOURS'] ?? 48);

// ── Request presentation ──────────────────────────────────────────────────────

export async function requestPresentation({ memberId, leaderId }: { memberId: string; leaderId: string }) {
  // Check for active pending/scheduled presentation
  const existing = await prisma.presentationRequest.findFirst({
    where: {
      memberId,
      status: { in: ['PENDING', 'RE_REQUESTED', 'ESCALATED', 'SCHEDULED'] },
    },
  });

  if (existing) {
    return {
      success: false as const,
      code: 'ACTIVE_REQUEST_EXISTS',
      error: 'You already have an active presentation request',
    };
  }

  // Verify leader exists
  const leader = await prisma.user.findUnique({
    where: { id: leaderId, role: 'LEADER', isActive: true },
    select: { id: true, name: true, email: true },
  });

  if (!leader) {
    return { success: false as const, code: 'LEADER_NOT_FOUND', error: 'Leader not found' };
  }

  const request = await prisma.presentationRequest.create({
    data: {
      memberId,
      leaderId,
      status: 'PENDING',
      requestedAt: new Date(),
    },
    select: { id: true, status: true, requestedAt: true },
  });

  // Notify member
  const member = await prisma.user.findUnique({ where: { id: memberId }, select: { email: true, name: true } });
  if (member) {
    sendEmail({
      to: member.email,
      template: 'presentation_requested',
      data: { name: member.name, leaderName: leader.name },
    }).catch(() => null);
  }

  return { success: true as const, data: request };
}

// ── Re-request (after Day 5 with no response) ─────────────────────────────────

export async function reRequestPresentation({ requestId, memberId }: { requestId: string; memberId: string }) {
  const request = await prisma.presentationRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true, memberId: true, requestedAt: true },
  });

  if (!request) return { success: false as const, code: 'NOT_FOUND', error: 'Request not found' };
  if (request.memberId !== memberId) return { success: false as const, code: 'FORBIDDEN', error: 'Forbidden' };

  if (request.status !== 'PENDING') {
    return { success: false as const, code: 'INVALID_STATE', error: `Cannot re-request from state ${request.status}` };
  }

  // Must be at least 5 days since initial request
  const daysSinceRequest = (Date.now() - request.requestedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceRequest < 5) {
    return {
      success: false as const,
      code: 'TOO_EARLY',
      error: `Re-request available after 5 days (${Math.ceil(5 - daysSinceRequest)} days remaining)`,
    };
  }

  await prisma.presentationRequest.update({
    where: { id: requestId },
    data: { status: 'RE_REQUESTED', reRequestedAt: new Date() },
  });

  return { success: true as const, data: { id: requestId, status: 'RE_REQUESTED' } };
}

// ── Escalate to platform manager (after Day 10) ───────────────────────────────

export async function escalatePresentation({ requestId, memberId }: { requestId: string; memberId: string }) {
  const request = await prisma.presentationRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true, memberId: true, requestedAt: true },
  });

  if (!request) return { success: false as const, code: 'NOT_FOUND', error: 'Request not found' };
  if (request.memberId !== memberId) return { success: false as const, code: 'FORBIDDEN', error: 'Forbidden' };

  if (!['PENDING', 'RE_REQUESTED'].includes(request.status)) {
    return { success: false as const, code: 'INVALID_STATE', error: `Cannot escalate from state ${request.status}` };
  }

  const daysSinceRequest = (Date.now() - request.requestedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceRequest < 10) {
    return {
      success: false as const,
      code: 'TOO_EARLY',
      error: `Escalation available after 10 days (${Math.ceil(10 - daysSinceRequest)} days remaining)`,
    };
  }

  await prisma.presentationRequest.update({
    where: { id: requestId },
    data: { status: 'ESCALATED', escalatedAt: new Date() },
  });

  return { success: true as const, data: { id: requestId, status: 'ESCALATED' } };
}

// ── Leader: schedule presentation ────────────────────────────────────────────

export async function schedulePresentation({
  requestId,
  leaderId,
  scheduledFor,
  platform,
  meetingLink,
}: {
  requestId: string;
  leaderId: string;
  scheduledFor: Date;
  platform: string;
  meetingLink: string;
}) {
  if (!MEETING_PLATFORMS.includes(platform as typeof MEETING_PLATFORMS[number])) {
    return { success: false as const, code: 'INVALID_PLATFORM', error: `Invalid platform. Must be one of: ${MEETING_PLATFORMS.join(', ')}` };
  }

  const request = await prisma.presentationRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true, leaderId: true, memberId: true },
  });

  if (!request) return { success: false as const, code: 'NOT_FOUND', error: 'Request not found' };
  if (request.leaderId !== leaderId) return { success: false as const, code: 'FORBIDDEN', error: 'You are not the assigned leader for this request' };

  const schedulableStatuses = ['PENDING', 'RE_REQUESTED', 'ESCALATED'];
  if (!schedulableStatuses.includes(request.status)) {
    return { success: false as const, code: 'INVALID_STATE', error: `Cannot schedule from state ${request.status}` };
  }

  if (scheduledFor < new Date()) {
    return { success: false as const, code: 'INVALID_DATE', error: 'Scheduled date must be in the future' };
  }

  // Encrypt meeting link before storage
  const encryptedLink = encrypt(meetingLink);

  await prisma.presentationRequest.update({
    where: { id: requestId },
    data: {
      status: 'SCHEDULED',
      scheduledFor,
      meetingPlatform: platform,
      meetingLink: encryptedLink,
      scheduledAt: new Date(),
    },
  });

  // Notify member with meeting details
  const member = await prisma.user.findUnique({ where: { id: request.memberId }, select: { email: true, name: true } });
  if (member) {
    sendEmail({
      to: member.email,
      template: 'presentation_scheduled',
      data: {
        name: member.name,
        scheduledFor: scheduledFor.toLocaleString(),
        platform,
        meetingLink, // Plain text in email (transmitted via TLS)
      },
    }).catch(() => null);
  }

  return { success: true as const, data: { id: requestId, status: 'SCHEDULED', scheduledFor, platform } };
}

// ── Get meeting link (member/leader/admin only, 48h max) ──────────────────────

export async function getMeetingLink({
  requestId,
  requestorId,
  requestorRole,
}: {
  requestId: string;
  requestorId: string;
  requestorRole: string;
}) {
  const request = await prisma.presentationRequest.findUnique({
    where: { id: requestId },
    select: { id: true, memberId: true, leaderId: true, meetingLink: true, scheduledFor: true, status: true, meetingPlatform: true },
  });

  if (!request) return { success: false as const, code: 'NOT_FOUND', error: 'Request not found' };

  const isAuthorized =
    request.memberId === requestorId ||
    request.leaderId === requestorId ||
    ['ADMIN', 'PLATFORM_MANAGER'].includes(requestorRole);

  if (!isAuthorized) {
    return { success: false as const, code: 'FORBIDDEN', error: 'You do not have access to this meeting link' };
  }

  if (!request.meetingLink) {
    return { success: false as const, code: 'NO_LINK', error: 'Meeting link not yet set' };
  }

  if (request.status !== 'SCHEDULED') {
    return { success: false as const, code: 'NOT_SCHEDULED', error: 'Presentation is not scheduled' };
  }

  // Check 48h link expiry
  if (request.scheduledFor) {
    const linkExpiresAt = new Date(request.scheduledFor.getTime() + MEETING_LINK_MAX_AGE_HOURS * 60 * 60 * 1000);
    if (new Date() > linkExpiresAt) {
      return { success: false as const, code: 'LINK_EXPIRED', error: 'Meeting link has expired' };
    }
  }

  const meetingLink = decrypt(request.meetingLink);

  return {
    success: true as const,
    data: {
      meetingLink,
      platform: request.meetingPlatform,
      scheduledFor: request.scheduledFor,
    },
  };
}

// ── Leader: submit decision (APPROVED or CANCELLED) ───────────────────────────

export async function submitDecision({
  requestId,
  leaderId,
  decision,
  leaderNote,
  cancellationReason,
  evidenceLink,
}: {
  requestId: string;
  leaderId: string;
  decision: 'APPROVED' | 'CANCELLED';
  leaderNote?: string;
  cancellationReason?: string;
  evidenceLink?: string;
}) {
  const request = await prisma.presentationRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true, leaderId: true, memberId: true },
  });

  if (!request) return { success: false as const, code: 'NOT_FOUND', error: 'Request not found' };
  if (request.leaderId !== leaderId) return { success: false as const, code: 'FORBIDDEN', error: 'Forbidden' };

  if (request.status !== 'SCHEDULED') {
    return { success: false as const, code: 'INVALID_STATE', error: `Cannot submit decision from state ${request.status}` };
  }

  if (decision === 'APPROVED') {
    await approvePresentation(request.id, request.memberId, leaderNote, evidenceLink);
  } else {
    await cancelPresentation(request.id, request.memberId, cancellationReason, leaderNote, evidenceLink);
  }

  return { success: true as const, data: { id: requestId, status: decision === 'APPROVED' ? 'APPROVED' : 'CANCELLED' } };
}

// ── Approve: activate ALL pending point batches ───────────────────────────────

async function approvePresentation(
  requestId: string,
  memberId: string,
  leaderNote?: string,
  evidenceLink?: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const now = new Date();

    // Get all pending batches
    const batches = await tx.pendingPointExpiry.findMany({
      where: { userId: memberId, state: 'PENDING' },
      select: { id: true, batchPoints: true },
    });

    const totalPoints = batches.reduce((sum, b) => sum + b.batchPoints, 0);

    // 1. Mark all batches ACTIVE
    await tx.pendingPointExpiry.updateMany({
      where: { userId: memberId, state: 'PENDING' },
      data: { state: 'ACTIVE' },
    });

    // 2. Single PointTransaction (ACTIVATED)
    await tx.pointTransaction.create({
      data: {
        userId: memberId,
        amount: totalPoints,
        state: 'ACTIVE',
        type: 'ACTIVATED',
        note: `${totalPoints} pending points activated after successful presentation`,
      },
    });

    // 3. Update user: pendingPoints → 0, activePoints += total
    const user = await tx.user.findUnique({ where: { id: memberId }, select: { activePoints: true } });
    const newActivePoints = (user?.activePoints ?? 0) + totalPoints;
    const newLevel = calculateLevel(newActivePoints);

    await tx.user.update({
      where: { id: memberId },
      data: { pendingPoints: 0, activePoints: newActivePoints, level: newLevel },
    });

    // 4. Update presentation status
    await tx.presentationRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        leaderDecision: 'APPROVED',
        leaderNote: leaderNote ? encrypt(leaderNote) : null,
        evidenceLink: evidenceLink ? encrypt(evidenceLink) : null,
        completedAt: now,
        decisionAt: now,
      },
    });

    // Notification
    await tx.notification.create({
      data: {
        userId: memberId,
        type: 'POINTS_ACTIVATED',
        title: 'Points Activated!',
        body: `Your ${totalPoints} pending points have been activated after a successful presentation.`,
      },
    });
  });

  // Send email outside transaction
  const member = await prisma.user.findUnique({ where: { id: memberId }, select: { email: true, name: true, activePoints: true } });
  if (member) {
    sendEmail({
      to: member.email,
      template: 'points_activated',
      data: { name: member.name, points: member.activePoints },
    }).catch(() => null);
  }

  logger.info({ memberId, requestId }, 'Presentation approved — points activated');
}

// ── Cancel: wipe ALL pending points + revert verified comments ────────────────

async function cancelPresentation(
  requestId: string,
  memberId: string,
  cancellationReason?: string,
  leaderNote?: string,
  evidenceLink?: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const now = new Date();

    // Get all pending batches
    const batches = await tx.pendingPointExpiry.findMany({
      where: { userId: memberId, state: 'PENDING' },
      select: { id: true, batchPoints: true },
    });

    const totalPoints = batches.reduce((sum, b) => sum + b.batchPoints, 0);

    // 1. Mark all batches WIPED
    await tx.pendingPointExpiry.updateMany({
      where: { userId: memberId, state: 'PENDING' },
      data: { state: 'WIPED' },
    });

    // 2. Single PointTransaction (WIPED, negative)
    await tx.pointTransaction.create({
      data: {
        userId: memberId,
        amount: -totalPoints,
        state: 'WIPED',
        type: 'WIPED',
        note: `${totalPoints} pending points wiped — presentation not verified`,
      },
    });

    // 3. User: pendingPoints → 0 (active points UNTOUCHED)
    await tx.user.update({
      where: { id: memberId },
      data: { pendingPoints: 0 },
    });

    // 4. Revert OPINION_VERIFIED comments → PUBLISHED (removes checkmarks)
    await tx.comment.updateMany({
      where: { authorId: memberId, status: 'OPINION_VERIFIED' },
      data: {
        status: 'PUBLISHED',
        fieldExpertApproverId: null,
        leaderApproverId: null,
        expertApprovedAt: null,
        leaderApprovedAt: null,
        verifiedAt: null,
        opinionPointsAwarded: null,
      },
    });

    // 5. Update presentation
    await tx.presentationRequest.update({
      where: { id: requestId },
      data: {
        status: 'CANCELLED',
        leaderDecision: 'CANCELLED',
        cancellationReason: cancellationReason ? encrypt(cancellationReason) : null,
        leaderNote: leaderNote ? encrypt(leaderNote) : null,
        evidenceLink: evidenceLink ? encrypt(evidenceLink) : null,
        completedAt: now,
        decisionAt: now,
      },
    });

    // Notification
    await tx.notification.create({
      data: {
        userId: memberId,
        type: 'POINTS_WIPED',
        title: 'Presentation Not Verified',
        body: `Following your presentation, ${totalPoints} pending points have been removed. Continue developing your analytical depth.`,
      },
    });
  });

  const member = await prisma.user.findUnique({ where: { id: memberId }, select: { email: true, name: true } });
  if (member) {
    sendEmail({
      to: member.email,
      template: 'points_cancelled',
      data: { name: member.name },
    }).catch(() => null);
  }

  logger.info({ memberId, requestId }, 'Presentation cancelled — points wiped');
}

// ── Level calculation ─────────────────────────────────────────────────────────

const LEVEL_THRESHOLDS: Array<{ min: number; level: string }> = [
  { min: 1000, level: 'RESEARCH_SCHOLAR' },
  { min: 500, level: 'COMMUNITY_EXPERT' },
  { min: 100, level: 'OPINION_LEADER' },
  { min: 0, level: 'MEMBER' },
];

function calculateLevel(activePoints: number): string {
  for (const threshold of LEVEL_THRESHOLDS) {
    if (activePoints >= threshold.min) return threshold.level;
  }
  return 'MEMBER';
}

// ── Get presentation requests ─────────────────────────────────────────────────

export async function getMyPresentations(memberId: string) {
  const requests = await prisma.presentationRequest.findMany({
    where: { memberId },
    orderBy: { requestedAt: 'desc' },
    select: {
      id: true,
      status: true,
      requestedAt: true,
      scheduledFor: true,
      meetingPlatform: true,
      leaderDecision: true,
      completedAt: true,
      decisionAt: true,
      // encrypted fields: NOT returned here — use getMeetingLink separately
      leader: { select: { id: true, name: true, username: true } },
    },
  });

  return { success: true as const, data: requests };
}

export async function getLeaderQueue(leaderId: string) {
  const requests = await prisma.presentationRequest.findMany({
    where: {
      leaderId,
      status: { in: ['PENDING', 'RE_REQUESTED', 'ESCALATED', 'SCHEDULED'] },
    },
    orderBy: { requestedAt: 'asc' },
    select: {
      id: true,
      status: true,
      requestedAt: true,
      reRequestedAt: true,
      escalatedAt: true,
      scheduledFor: true,
      meetingPlatform: true,
      member: {
        select: {
          id: true,
          name: true,
          username: true,
          level: true,
          pendingPoints: true,
        },
      },
    },
  });

  return { success: true as const, data: requests };
}
