// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Email Service (Resend)
// All sends are fire-and-forget — callers catch errors individually
// ─────────────────────────────────────────────────────────────────────────────

import { Resend } from 'resend';
import { logger } from './logger.js';

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  _resend = new Resend(apiKey);
  return _resend;
}

const FROM = process.env['FROM_EMAIL'] ?? 'noreply@islamicmessagingsystem.com';
const REPLY_TO = process.env['REPLY_TO_EMAIL'] ?? 'support@islamicmessagingsystem.com';
const APP_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';

// ── Template renderers (plain HTML — React Email templates in /emails dir) ────

function renderTemplate(template: string, data: Record<string, unknown>): { subject: string; html: string } {
  // Simple template rendering — in production these would be React Email components
  // compiled to HTML. For now returns readable HTML.
  const templates: Record<string, (d: Record<string, unknown>) => { subject: string; html: string }> = {
    welcome_member: (d) => ({
      subject: `Welcome to IMS News Central, ${d['name']}`,
      html: `<h1>Welcome to IMS News Central</h1><p>Hi ${d['name']}, your account has been created. Start engaging with the community at <a href="${APP_URL}">${APP_URL}</a>.</p>`,
    }),
    points_expiry_14: (d) => ({
      subject: `Your ${d['points']} pending points expire in 14 days`,
      html: `<h2>Points Expiry Warning</h2><p>Hi ${d['name']}, you have <strong>${d['points']} pending points</strong> expiring on ${d['expiresAt']}. Request a presentation on IMS News Central to activate them before they expire.</p><p><a href="${APP_URL}/dashboard/member">Go to Dashboard</a></p>`,
    }),
    points_expiry_7: (d) => ({
      subject: `Urgent: Your ${d['points']} pending points expire in 7 days`,
      html: `<h2>7-Day Expiry Warning</h2><p>Hi ${d['name']}, your <strong>${d['points']} pending points</strong> expire on ${d['expiresAt']}. Act now — request a presentation immediately.</p><p><a href="${APP_URL}/dashboard/member">Request Presentation</a></p>`,
    }),
    points_expiry_24h: (d) => ({
      subject: `FINAL WARNING: ${d['points']} points expire in 24 hours`,
      html: `<h2>Final Expiry Warning</h2><p>Hi ${d['name']}, this is your final warning. <strong>${d['points']} pending points</strong> expire on ${d['expiresAt']}. Request a presentation immediately or these points will be permanently lost.</p>`,
    }),
    points_expired: (d) => ({
      subject: `${d['points']} pending points have expired`,
      html: `<h2>Points Expired</h2><p>Hi ${d['name']}, <strong>${d['points']} pending points</strong> have expired because a presentation was not completed within 60 days. Continue engaging with quality analysis to earn more points.</p>`,
    }),
    points_activated: (d) => ({
      subject: `Congratulations! ${d['points']} points activated`,
      html: `<h2>Points Activated!</h2><p>Hi ${d['name']}, your community leader has verified your presentation. <strong>${d['points']} points</strong> have been moved from pending to your active balance.</p>`,
    }),
    points_cancelled: (d) => ({
      subject: 'Presentation not verified — points removed',
      html: `<h2>Presentation Review</h2><p>Hi ${d['name']}, following your presentation, your community leader was unable to verify the submitted analysis. Your pending points have been removed. Review the feedback and continue developing your analytical depth.</p>`,
    }),
    presentation_requested: (d) => ({
      subject: 'Presentation request received',
      html: `<h2>Presentation Requested</h2><p>Hi ${d['name']}, your community leader <strong>${d['leaderName']}</strong> will schedule a presentation within 5 days. You will receive a meeting link by email.</p>`,
    }),
    presentation_scheduled: (d) => ({
      subject: 'Your presentation has been scheduled',
      html: `<h2>Presentation Scheduled</h2><p>Hi ${d['name']}, your presentation is scheduled for <strong>${d['scheduledFor']}</strong>. <a href="${d['meetingLink']}">Join via ${d['platform']}</a>. This link expires in 48 hours.</p>`,
    }),
    comment_approved: (d) => ({
      subject: 'Your comment has been published',
      html: `<h2>Comment Approved</h2><p>Hi ${d['name']}, your comment on "<strong>${d['storyTitle']}</strong>" has been approved and is now visible to the community.</p>`,
    }),
    checkmark_granted: (d) => ({
      subject: 'Verified checkmark awarded to your comment',
      html: `<h2>Comment Verified</h2><p>Hi ${d['name']}, both a field expert and community leader have verified your analysis on "<strong>${d['storyTitle']}</strong>". Your comment now displays a verified checkmark and pending points have been awarded.</p>`,
    }),
    expert_approved: (d) => ({
      subject: 'Field Expert application approved',
      html: `<h2>Expert Application Approved</h2><p>Hi ${d['name']}, your Field Expert application for the <strong>${d['field']}</strong> field has been approved. You may now review opinion requests in your approved field.</p>`,
    }),
  };

  const renderer = templates[template];
  if (!renderer) {
    return {
      subject: 'IMS News Central Notification',
      html: `<p>You have a new notification from IMS News Central. Visit <a href="${APP_URL}">${APP_URL}</a> for details.</p>`,
    };
  }

  return renderer(data);
}

// ── Send function ─────────────────────────────────────────────────────────────

export async function sendEmail({
  to,
  subject,
  template,
  data,
  html: rawHtml,
}: {
  to: string;
  subject?: string;
  template?: string;
  data?: Record<string, unknown>;
  html?: string;
}): Promise<void> {
  let finalSubject = subject ?? 'IMS News Central';
  let finalHtml = rawHtml ?? '';

  if (template && data) {
    const rendered = renderTemplate(template, data);
    finalSubject = subject ?? rendered.subject;
    finalHtml = rendered.html;
  }

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to,
      subject: finalSubject,
      html: finalHtml,
    });
  } catch (err) {
    logger.error({ err, to, template }, 'Email send failed');
    throw err;
  }
}
