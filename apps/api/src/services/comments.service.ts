// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Comments Service
//
// State machine:
//   PENDING_EDITOR → PUBLISHED / REJECTED_EDITOR
//   PUBLISHED → PENDING_OPINION_REVIEW
//   PENDING_OPINION_REVIEW → OPINION_EXPERT_APPROVED / OPINION_REJECTED
//   OPINION_EXPERT_APPROVED → OPINION_VERIFIED (both approvers set) / OPINION_REJECTED
//
// Invariants enforced here:
//   1. Checkmark (OPINION_VERIFIED) requires BOTH fieldExpertApproverId AND leaderApproverId
//   2. pendingPoints and activePoints are separate — never combined
//   3. awardPendingPoints creates a per-batch PendingPointExpiry with its own 60-day clock
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { sendEmail } from '../lib/email.js';

const OPINION_POINTS_PER_COMMENT = 15;
const EXPIRY_DAYS = 60;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

// ── Submit comment ────────────────────────────────────────────────────────────

export async function submitComment({
  storyId,
  authorId,
  content,
  requiredField,
  parentId,
}: {
  storyId: string;
  authorId: string;
  content: string;
  requiredField?: string;
  parentId?: string;
}) {
  // Verify story exists and is published
  const story = await prisma.newsStory.findUnique({
    where: { id: storyId, isPublished: true },
    select: { id: true, headline: true },
  });

  if (!story) {
    return { success: false as const, code: 'NOT_FOUND', error: 'Story not found' };
  }

  // If replying, verify parent comment exists and belongs to same story
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { id: true, storyId: true },
    });
    if (!parentComment || parentComment.storyId !== storyId) {
      return { success: false as const, code: 'NOT_FOUND', error: 'Parent comment not found' };
    }
  }

  const comment = await prisma.comment.create({
    data: {
      storyId,
      authorId,
      content: content.trim(),
      status: 'PENDING_EDITOR',
      requiredField: requiredField ?? null,
      isPublished: false,
      submittedAt: new Date(),
      parentId: parentId ?? null,
    },
    select: { id: true, status: true, createdAt: true },
  });

  return { success: true as const, data: comment };
}

// ── Editor: approve or reject ─────────────────────────────────────────────────

export async function editorDecision({
  commentId,
  editorId,
  approve,
  rejectionReason,
}: {
  commentId: string;
  editorId: string;
  approve: boolean;
  rejectionReason?: string;
}) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, status: true, authorId: true, storyId: true },
  });

  if (!comment) {
    return { success: false as const, code: 'NOT_FOUND', error: 'Comment not found' };
  }

  if (comment.status !== 'PENDING_EDITOR') {
    return { success: false as const, code: 'INVALID_STATE', error: `Comment is ${comment.status}, not PENDING_EDITOR` };
  }

  const newStatus = approve ? 'PUBLISHED' : 'REJECTED_EDITOR';

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: newStatus,
      isPublished: approve,
      publishedAt: approve ? new Date() : undefined,
      editorId,
      editorDecidedAt: new Date(),
      rejectionReason: approve ? null : (rejectionReason ?? 'Did not meet publication standards'),
    },
  });

  // Notify author
  if (approve) {
    const author = await prisma.user.findUnique({ where: { id: comment.authorId }, select: { email: true, name: true } });
    const story = await prisma.newsStory.findUnique({ where: { id: comment.storyId }, select: { headline: true } });
    if (author && story) {
      sendEmail({
        to: author.email,
        template: 'comment_approved',
        data: { name: author.name, storyTitle: story.headline },
      }).catch(() => null);
    }
  }

  return { success: true as const, data: { id: commentId, status: newStatus } };
}

// ── Member: request opinion points ───────────────────────────────────────────

export async function requestOpinionPoints({ commentId, memberId }: { commentId: string; memberId: string }) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, status: true, authorId: true, opinionRequestedAt: true },
  });

  if (!comment) {
    return { success: false as const, code: 'NOT_FOUND', error: 'Comment not found' };
  }

  if (comment.authorId !== memberId) {
    return { success: false as const, code: 'FORBIDDEN', error: 'You can only request points for your own comments' };
  }

  if (comment.status !== 'PUBLISHED') {
    return { success: false as const, code: 'INVALID_STATE', error: 'Comment must be published to request opinion points' };
  }

  if (comment.opinionRequestedAt) {
    return { success: false as const, code: 'ALREADY_REQUESTED', error: 'Opinion points already requested for this comment' };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: 'PENDING_OPINION_REVIEW',
      opinionRequestedAt: new Date(),
    },
  });

  return { success: true as const, data: { id: commentId, status: 'PENDING_OPINION_REVIEW' } };
}

// ── Field expert: approve opinion ─────────────────────────────────────────────

export async function expertApproveOpinion({
  commentId,
  expertUserId,
  approvedField,
}: {
  commentId: string;
  expertUserId: string;
  approvedField: string;
}) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      status: true,
      requiredField: true,
      fieldExpertApproverId: true,
      leaderApproverId: true,
      authorId: true,
    },
  });

  if (!comment) {
    return { success: false as const, code: 'NOT_FOUND', error: 'Comment not found' };
  }

  const validStatuses = ['PENDING_OPINION_REVIEW', 'OPINION_EXPERT_APPROVED'];
  if (!validStatuses.includes(comment.status)) {
    return { success: false as const, code: 'INVALID_STATE', error: `Comment is ${comment.status}` };
  }

  if (comment.fieldExpertApproverId) {
    return { success: false as const, code: 'ALREADY_APPROVED', error: 'Field expert has already approved this comment' };
  }

  // Field boundary check (defense-in-depth — also enforced by validateFieldBoundary middleware)
  if (comment.requiredField && comment.requiredField !== approvedField) {
    logger.warn({ commentId, requiredField: comment.requiredField, expertField: approvedField }, 'Field boundary violation in service');
    return {
      success: false as const,
      code: 'FIELD_BOUNDARY_VIOLATION',
      error: `This comment requires field "${comment.requiredField}" but you are approved for "${approvedField}"`,
    };
  }

  // Determine new status
  const leaderAlreadyApproved = !!comment.leaderApproverId;
  const newStatus = leaderAlreadyApproved ? 'OPINION_VERIFIED' : 'OPINION_EXPERT_APPROVED';

  await prisma.$transaction(async (tx) => {
    await tx.comment.update({
      where: { id: commentId },
      data: {
        fieldExpertApproverId: expertUserId,
        expertApprovedAt: new Date(),
        status: newStatus,
        ...(newStatus === 'OPINION_VERIFIED' ? { verifiedAt: new Date() } : {}),
      },
    });

    if (newStatus === 'OPINION_VERIFIED') {
      await awardPendingPointsInTx(tx, comment.authorId, commentId);
    }
  });

  if (newStatus === 'OPINION_VERIFIED') {
    await notifyCheckmarkGranted(comment.authorId, commentId);
  }

  return { success: true as const, data: { id: commentId, status: newStatus } };
}

// ── Leader: approve opinion ───────────────────────────────────────────────────

export async function leaderApproveOpinion({
  commentId,
  leaderUserId,
}: {
  commentId: string;
  leaderUserId: string;
}) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      status: true,
      fieldExpertApproverId: true,
      leaderApproverId: true,
      authorId: true,
    },
  });

  if (!comment) {
    return { success: false as const, code: 'NOT_FOUND', error: 'Comment not found' };
  }

  const validStatuses = ['PENDING_OPINION_REVIEW', 'OPINION_EXPERT_APPROVED'];
  if (!validStatuses.includes(comment.status)) {
    return { success: false as const, code: 'INVALID_STATE', error: `Comment is ${comment.status}` };
  }

  if (comment.leaderApproverId) {
    return { success: false as const, code: 'ALREADY_APPROVED', error: 'Leader has already approved this comment' };
  }

  const expertAlreadyApproved = !!comment.fieldExpertApproverId;
  const newStatus = expertAlreadyApproved ? 'OPINION_VERIFIED' : 'PENDING_OPINION_REVIEW';

  await prisma.$transaction(async (tx) => {
    await tx.comment.update({
      where: { id: commentId },
      data: {
        leaderApproverId: leaderUserId,
        leaderApprovedAt: new Date(),
        status: newStatus,
        ...(newStatus === 'OPINION_VERIFIED' ? { verifiedAt: new Date() } : {}),
      },
    });

    if (newStatus === 'OPINION_VERIFIED') {
      await awardPendingPointsInTx(tx, comment.authorId, commentId);
    }
  });

  if (newStatus === 'OPINION_VERIFIED') {
    await notifyCheckmarkGranted(comment.authorId, commentId);
  }

  return { success: true as const, data: { id: commentId, status: newStatus } };
}

// ── Reject opinion ────────────────────────────────────────────────────────────

export async function rejectOpinion({
  commentId,
  rejectorId,
  reason,
}: {
  commentId: string;
  rejectorId: string;
  reason?: string;
}) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, status: true },
  });

  if (!comment) {
    return { success: false as const, code: 'NOT_FOUND', error: 'Comment not found' };
  }

  const rejectableStatuses = ['PENDING_OPINION_REVIEW', 'OPINION_EXPERT_APPROVED'];
  if (!rejectableStatuses.includes(comment.status)) {
    return { success: false as const, code: 'INVALID_STATE', error: `Cannot reject comment in state ${comment.status}` };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: 'OPINION_REJECTED',
      rejectionReason: reason ?? 'Opinion did not meet verification standards',
    },
  });

  return { success: true as const, data: { id: commentId, status: 'OPINION_REJECTED' } };
}

// ── Award pending points (4-write atomic transaction) ─────────────────────────

async function awardPendingPointsInTx(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  userId: string,
  commentId: string,
): Promise<void> {
  const points = OPINION_POINTS_PER_COMMENT;
  const now = new Date();
  const expiresAt = addDays(now, EXPIRY_DAYS);

  // 1. Create PointTransaction (state: PENDING)
  const ptx = await tx.pointTransaction.create({
    data: {
      userId,
      amount: points,
      state: 'PENDING',
      type: 'OPINION_VERIFIED',
      commentId,
      note: `${points} pending points awarded for verified opinion comment`,
    },
  });

  // 2. Create PendingPointExpiry (per-batch 60-day clock)
  await tx.pendingPointExpiry.create({
    data: {
      userId,
      batchPoints: points,
      earnedAt: now,
      expiresAt,
      state: 'PENDING',
      warningDay46: false,
      warningDay53: false,
      warningDay59: false,
      pointTransactionId: ptx.id,
    },
  });

  // 3. Increment user.pendingPoints
  await tx.user.update({
    where: { id: userId },
    data: { pendingPoints: { increment: points } },
  });

  // 4. Set opinionPointsAwarded on comment
  await tx.comment.update({
    where: { id: commentId },
    data: { opinionPointsAwarded: points },
  });
}

// ── Notify checkmark granted ──────────────────────────────────────────────────

async function notifyCheckmarkGranted(userId: string, commentId: string): Promise<void> {
  const [user, comment] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
    prisma.comment.findUnique({
      where: { id: commentId },
      select: { story: { select: { headline: true } } },
    }),
  ]);

  if (!user || !comment?.story) return;

  await Promise.allSettled([
    prisma.notification.create({
      data: {
        userId,
        type: 'COMMENT_VERIFIED',
        title: 'Comment Verified — Points Awarded',
        body: `Your comment on "${comment.story.headline}" has received both approvals. ${OPINION_POINTS_PER_COMMENT} pending points awarded.`,
      },
    }),
    sendEmail({
      to: user.email,
      template: 'checkmark_granted',
      data: { name: user.name, storyTitle: comment.story.headline, points: OPINION_POINTS_PER_COMMENT },
    }),
  ]);
}

// ── Get comments for a story ──────────────────────────────────────────────────

export async function getStoryComments({
  storyId,
  viewerUserId,
  page,
  pageSize,
}: {
  storyId: string;
  viewerUserId?: string | null;
  page: number;
  pageSize: number;
}) {
  const skip = (page - 1) * pageSize;

      const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { storyId, isPublished: true, parentId: null },
      orderBy: [{ status: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: pageSize,
      select: {
        id: true,
        content: true,
        status: true,
        opinionPointsAwarded: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: { id: true, name: true, username: true, avatarUrl: true, level: true, role: true },
        },
        fieldExpertApproverId: true,
        leaderApproverId: true,
        _count: { select: { likes: true, replies: true } },
        replies: {
          where: { isPublished: true },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            status: true,
            publishedAt: true,
            createdAt: true,
            author: {
              select: { id: true, name: true, username: true, avatarUrl: true, level: true, role: true },
            },
            _count: { select: { likes: true } },
          },
        },
      },
    }),
    prisma.comment.count({ where: { storyId, isPublished: true, parentId: null } }),
  ]);

  // Map: compute isVerified, hide FK IDs from public response
  const mapped = comments.map((c) => ({
    id: c.id,
    content: c.content,
    status: c.status,
    isVerified: c.status === 'OPINION_VERIFIED',
    opinionPointsAwarded: c.status === 'OPINION_VERIFIED' ? c.opinionPointsAwarded : null,
    publishedAt: c.publishedAt,
    createdAt: c.createdAt,
    author: c.author,
    likeCount: c._count.likes,
  }));

  return {
    success: true as const,
    data: mapped,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: skip + pageSize < total,
      hasPrev: page > 1,
    },
  };
}
