// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Points Expiry Cron Job
// Runs: 00:01 daily
//
// Rules:
//   - Operates per-batch (each PendingPointExpiry row = one batch)
//   - Warning emails sent exactly once per batch via boolean flags
//   - Expired batches: debit pendingPoints, mark EXPIRED, create PointTransaction
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { sendEmail } from '../lib/email.js';

export async function processExpiredPoints(): Promise<void> {
  const now = new Date();

  logger.info('Running points expiry job');

  // ── Expire overdue batches ────────────────────────────────────────────────
  const expiredBatches = await prisma.pendingPointExpiry.findMany({
    where: { expiresAt: { lte: now }, state: 'PENDING' },
    include: { user: { select: { id: true, email: true, name: true, pendingPoints: true } } },
  });

  for (const batch of expiredBatches) {
    try {
      await prisma.$transaction([
        // Mark batch expired
        prisma.pendingPointExpiry.update({
          where: { id: batch.id },
          data: { state: 'EXPIRED' },
        }),
        // Debit user's pending points (floor at 0)
        prisma.user.update({
          where: { id: batch.userId },
          data: {
            pendingPoints: {
              decrement: Math.min(batch.batchPoints, batch.user.pendingPoints),
            },
          },
        }),
        // Create transaction record
        prisma.pointTransaction.create({
          data: {
            userId: batch.userId,
            amount: -batch.batchPoints,
            state: 'EXPIRED',
            type: 'EXPIRED',
            note: `Batch of ${batch.batchPoints} pending points expired (60-day deadline)`,
          },
        }),
        // Notification
        prisma.notification.create({
          data: {
            userId: batch.userId,
            type: 'POINTS_EXPIRED',
            title: 'Pending Points Expired',
            body: `${batch.batchPoints} pending points have expired because you did not complete a presentation within 60 days.`,
          },
        }),
      ]);

      // Send expiry email
      await sendEmail({
        to: batch.user.email,
        subject: 'Your pending points have expired',
        template: 'points_expired',
        data: {
          name: batch.user.name,
          points: batch.batchPoints,
          expiredAt: batch.expiresAt.toLocaleDateString(),
        },
      }).catch((err) => logger.error({ err, userId: batch.userId }, 'Expiry email failed'));

      logger.info({ userId: batch.userId, batchId: batch.id, points: batch.batchPoints }, 'Batch expired');
    } catch (err) {
      logger.error({ err, batchId: batch.id }, 'Failed to expire batch');
    }
  }

  // ── Warning Day 46 (14 days remaining) ───────────────────────────────────
  const day46Threshold = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const day46Batches = await prisma.pendingPointExpiry.findMany({
    where: {
      state: 'PENDING',
      warningDay46: false,
      expiresAt: { lte: day46Threshold },
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  for (const batch of day46Batches) {
    await prisma.pendingPointExpiry.update({
      where: { id: batch.id },
      data: { warningDay46: true },
    });

    await prisma.notification.create({
      data: {
        userId: batch.userId,
        type: 'POINTS_EXPIRY_WARNING',
        title: 'Points Expiring in 14 Days',
        body: `You have ${batch.batchPoints} pending points expiring in 14 days. Request a presentation now to secure them.`,
      },
    });

    await sendEmail({
      to: batch.user.email,
      subject: 'Your pending points expire in 14 days',
      template: 'points_expiry_14',
      data: { name: batch.user.name, points: batch.batchPoints, expiresAt: batch.expiresAt.toLocaleDateString() },
    }).catch(() => null);
  }

  // ── Warning Day 53 (7 days remaining) ────────────────────────────────────
  const day53Threshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const day53Batches = await prisma.pendingPointExpiry.findMany({
    where: {
      state: 'PENDING',
      warningDay46: true,
      warningDay53: false,
      expiresAt: { lte: day53Threshold },
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  for (const batch of day53Batches) {
    await prisma.pendingPointExpiry.update({
      where: { id: batch.id },
      data: { warningDay53: true },
    });

    await prisma.notification.create({
      data: {
        userId: batch.userId,
        type: 'POINTS_EXPIRY_WARNING',
        title: 'Points Expiring in 7 Days',
        body: `Urgent: ${batch.batchPoints} pending points expire in 7 days. Request a presentation immediately.`,
      },
    });

    await sendEmail({
      to: batch.user.email,
      subject: 'Your pending points expire in 7 days',
      template: 'points_expiry_7',
      data: { name: batch.user.name, points: batch.batchPoints, expiresAt: batch.expiresAt.toLocaleDateString() },
    }).catch(() => null);
  }

  // ── Warning Day 59 (24 hours remaining) ──────────────────────────────────
  const day59Threshold = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const day59Batches = await prisma.pendingPointExpiry.findMany({
    where: {
      state: 'PENDING',
      warningDay53: true,
      warningDay59: false,
      expiresAt: { lte: day59Threshold },
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  for (const batch of day59Batches) {
    await prisma.pendingPointExpiry.update({
      where: { id: batch.id },
      data: { warningDay59: true },
    });

    await prisma.notification.create({
      data: {
        userId: batch.userId,
        type: 'POINTS_EXPIRY_WARNING',
        title: 'Points Expiring in 24 Hours',
        body: `Final warning: ${batch.batchPoints} pending points expire in less than 24 hours.`,
      },
    });

    await sendEmail({
      to: batch.user.email,
      subject: 'FINAL WARNING: Your pending points expire in 24 hours',
      template: 'points_expiry_24h',
      data: { name: batch.user.name, points: batch.batchPoints, expiresAt: batch.expiresAt.toLocaleDateString() },
    }).catch(() => null);
  }

  logger.info(
    {
      expired: expiredBatches.length,
      warned46: day46Batches.length,
      warned53: day53Batches.length,
      warned59: day59Batches.length,
    },
    'Points expiry job complete',
  );
}
