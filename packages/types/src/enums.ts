// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Shared Enums
// Single source of truth for all domain enums.
// Consumed by both apps/api and apps/web.
// Changes here may require database migrations.
// ─────────────────────────────────────────────────────────────────────────────

// ── User & Auth ───────────────────────────────────────────────────────────────

export enum UserRole {
  MEMBER = 'MEMBER',
  OPINION_LEADER = 'OPINION_LEADER',
  COMMUNITY_EXPERT = 'COMMUNITY_EXPERT',
  FIELD_EXPERT = 'FIELD_EXPERT',
  EDITOR = 'EDITOR',
  LEADER = 'LEADER',
  PLATFORM_MANAGER = 'PLATFORM_MANAGER',
  ADMIN = 'ADMIN',
}

export enum MemberType {
  IMS_MEMBER = 'IMS_MEMBER',
  NON_IMS_MEMBER = 'NON_IMS_MEMBER',
}

export enum UserLevel {
  MEMBER = 'MEMBER',             // Level 1 — base level
  OPINION_LEADER = 'OPINION_LEADER',   // Level 2 — earned via active points
  COMMUNITY_EXPERT = 'COMMUNITY_EXPERT', // Level 3 — highest earned level
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ── Comment Approval State Machine ────────────────────────────────────────────
// State transitions (see plan for full diagram):
// PENDING_EDITOR → PUBLISHED | REJECTED_EDITOR
// PUBLISHED → PENDING_OPINION_REVIEW (member requests opinion points)
// PENDING_OPINION_REVIEW → OPINION_EXPERT_APPROVED | OPINION_REJECTED
// OPINION_EXPERT_APPROVED → OPINION_VERIFIED | OPINION_REJECTED
// INVARIANT: OPINION_VERIFIED requires BOTH fieldExpertApproverId AND leaderApproverId non-null

export enum CommentStatus {
  PENDING_EDITOR = 'PENDING_EDITOR',
  PUBLISHED = 'PUBLISHED',
  REJECTED_EDITOR = 'REJECTED_EDITOR',
  PENDING_OPINION_REVIEW = 'PENDING_OPINION_REVIEW',
  OPINION_EXPERT_APPROVED = 'OPINION_EXPERT_APPROVED',
  OPINION_VERIFIED = 'OPINION_VERIFIED',   // Checkmark shown — both approvers confirmed
  OPINION_REJECTED = 'OPINION_REJECTED',
}

export enum CommentTargetType {
  NEWS_STORY = 'NEWS_STORY',
  JOURNAL_PAPER = 'JOURNAL_PAPER',
  VIDEO = 'VIDEO',
  FOREIGN_POLICY_ENTRY = 'FOREIGN_POLICY_ENTRY',
}

// ── Points ────────────────────────────────────────────────────────────────────
// INVARIANT: pendingPoints and activePoints are ALWAYS stored as separate fields.
// They are never combined in any query or display.
// INVARIANT: Expiry is tracked PER BATCH via PendingPointExpiry, not per point.

export enum PointState {
  PENDING = 'PENDING',   // Earned but awaiting presentation — shown in amber, hidden from public
  ACTIVE = 'ACTIVE',     // Activated via approved presentation — shown in blue, drives progression
  EXPIRED = 'EXPIRED',   // 60-day batch expiry triggered — never activated
  WIPED = 'WIPED',       // Presentation cancelled — all pending wiped, active untouched
}

export enum PointTransactionType {
  OPINION_EARNED = 'OPINION_EARNED',   // Comment verified (OPINION_VERIFIED state reached)
  FEATURED_EARNED = 'FEATURED_EARNED', // Leader featured a comment (+50 pending)
  ACTIVATED = 'ACTIVATED',             // Presentation approved → batch moved to active
  EXPIRED = 'EXPIRED',                 // 60-day expiry triggered on a batch
  WIPED = 'WIPED',                     // Presentation cancelled → batch wiped
}

// ── Presentations ─────────────────────────────────────────────────────────────

export enum PresentationStatus {
  PENDING = 'PENDING',         // Initial request sent (Day 1)
  RE_REQUESTED = 'RE_REQUESTED', // Second request (Day 5, unlocked by cron)
  ESCALATED = 'ESCALATED',     // Escalated to platform manager (Day 10, unlocked by cron)
  SCHEDULED = 'SCHEDULED',     // Leader/manager scheduled the meeting
  COMPLETED = 'COMPLETED',     // Meeting held, awaiting leader decision
  APPROVED = 'APPROVED',       // Leader approved → pending points activate
  CANCELLED = 'CANCELLED',     // Leader cancelled → pending points wiped
  DISPUTED = 'DISPUTED',       // Member disputed a cancellation
  EXPIRED = 'EXPIRED',         // No response and no escalation — rare edge case
}

export enum LeaderDecision {
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
}

export enum MeetingPlatform {
  ZOOM = 'zoom',
  GOOGLE_MEET = 'google_meet',
  TEAMS = 'teams',
  OTHER = 'other',
}

// ── News ──────────────────────────────────────────────────────────────────────

export enum NewsStoryStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum AISummaryStatus {
  PENDING = 'PENDING',   // Queued for AI processing
  DONE = 'DONE',         // AI summary generated successfully
  FAILED = 'FAILED',     // AI call failed — retry once after 1 hour
}

export enum OpinionAuthorType {
  IMS_LEADER = 'IMS_LEADER',
  EXTERNAL_EXPERT = 'EXTERNAL_EXPERT',
}

// ── Knowledge Library ─────────────────────────────────────────────────────────

export enum PolicyShiftType {
  MAJOR_SHIFT = 'MAJOR_SHIFT',
  MINOR_UPDATE = 'MINOR_UPDATE',
  REAFFIRMATION = 'REAFFIRMATION',
}

// ── Video ─────────────────────────────────────────────────────────────────────

export enum VideoUploadStatus {
  PENDING = 'PENDING',       // Created in DB, not yet uploaded to Bunny
  UPLOADING = 'UPLOADING',   // TUS upload in progress
  PROCESSING = 'PROCESSING', // Bunny encoding in progress (webhook pending)
  READY = 'READY',           // Encoded — ready for signed URL playback
  FAILED = 'FAILED',         // Bunny encoding failed
}

export enum VideoDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum ExternalEmbedType {
  YOUTUBE = 'YOUTUBE',
  VIMEO = 'VIMEO',
  DAILYMOTION = 'DAILYMOTION',
  DIRECT_URL = 'DIRECT_URL',
}

// ── Research ──────────────────────────────────────────────────────────────────

export enum ResearchTeamStatus {
  FORMING = 'FORMING',
  ACTIVE = 'ACTIVE',
  REVIEW_STAGE = 'REVIEW_STAGE',
  SUBMITTED = 'SUBMITTED',
  PUBLISHED = 'PUBLISHED',
}

export enum ResearchTeamMemberRole {
  LEAD = 'LEAD',
  CONTRIBUTOR = 'CONTRIBUTOR',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WAITLISTED = 'WAITLISTED',
}

export enum AcademyTrack {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum PaperReviewStatus {
  SUBMITTED = 'SUBMITTED',
  ASSIGNED = 'ASSIGNED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  FEEDBACK_SENT = 'FEEDBACK_SENT',
  REVISED = 'REVISED',
  PUBLISHED = 'PUBLISHED',
}

// ── Notifications ─────────────────────────────────────────────────────────────

export enum NotificationType {
  // Comments
  COMMENT_PUBLISHED = 'COMMENT_PUBLISHED',
  COMMENT_REJECTED = 'COMMENT_REJECTED',
  REPLY_RECEIVED = 'REPLY_RECEIVED',
  COMMENT_LIKED = 'COMMENT_LIKED',

  // Opinion approval chain
  OPINION_REQUEST_RECEIVED = 'OPINION_REQUEST_RECEIVED',
  OPINION_EXPERT_APPROVED = 'OPINION_EXPERT_APPROVED',
  OPINION_VERIFIED = 'OPINION_VERIFIED',     // Both approved — checkmark granted
  OPINION_REJECTED = 'OPINION_REJECTED',

  // Points
  POINTS_PENDING = 'POINTS_PENDING',                   // Pending points awarded
  POINTS_EXPIRY_WARNING_14 = 'POINTS_EXPIRY_WARNING_14', // Day 46
  POINTS_EXPIRY_WARNING_7 = 'POINTS_EXPIRY_WARNING_7',   // Day 53
  POINTS_EXPIRY_WARNING_1 = 'POINTS_EXPIRY_WARNING_1',   // Day 59
  POINTS_EXPIRED = 'POINTS_EXPIRED',
  POINTS_ACTIVATED = 'POINTS_ACTIVATED',
  POINTS_WIPED = 'POINTS_WIPED',

  // Level progression
  LEVEL_UP = 'LEVEL_UP',

  // Presentations
  PRESENTATION_REQUESTED = 'PRESENTATION_REQUESTED',
  PRESENTATION_RE_REQUEST_AVAILABLE = 'PRESENTATION_RE_REQUEST_AVAILABLE',
  PRESENTATION_ESCALATE_AVAILABLE = 'PRESENTATION_ESCALATE_AVAILABLE',
  PRESENTATION_SCHEDULED = 'PRESENTATION_SCHEDULED',
  PRESENTATION_APPROVED = 'PRESENTATION_APPROVED',
  PRESENTATION_CANCELLED = 'PRESENTATION_CANCELLED',

  // Research
  RESEARCH_APPLICATION_RECEIVED = 'RESEARCH_APPLICATION_RECEIVED',
  RESEARCH_APPLICATION_ACCEPTED = 'RESEARCH_APPLICATION_ACCEPTED',
  RESEARCH_APPLICATION_REJECTED = 'RESEARCH_APPLICATION_REJECTED',

  // Academy
  COURSE_COMPLETED = 'COURSE_COMPLETED',
  CERTIFICATE_ISSUED = 'CERTIFICATE_ISSUED',

  // Paper review
  PAPER_REVIEW_ASSIGNED = 'PAPER_REVIEW_ASSIGNED',
  PAPER_REVIEW_FEEDBACK = 'PAPER_REVIEW_FEEDBACK',

  // Video
  VIDEO_ENCODING_COMPLETE = 'VIDEO_ENCODING_COMPLETE',
  VIDEO_ENCODING_FAILED = 'VIDEO_ENCODING_FAILED',

  // Expert application
  EXPERT_APPLICATION_RECEIVED = 'EXPERT_APPLICATION_RECEIVED',
  EXPERT_APPLICATION_APPROVED = 'EXPERT_APPLICATION_APPROVED',
  EXPERT_APPLICATION_REJECTED = 'EXPERT_APPLICATION_REJECTED',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}
