// ─────────────────────────────────────────────────────────────────────────────
// IMS News Central — Domain DTOs
// These represent what the API exposes — not raw Prisma types.
// Sensitive fields (pendingPoints, encrypted columns) are excluded from public DTOs.
// ─────────────────────────────────────────────────────────────────────────────

import type { UserRole, UserLevel, MemberType, CommentStatus, PointState, VideoUploadStatus, VideoDifficulty, ExternalEmbedType, PresentationStatus, LeaderDecision, MeetingPlatform, ResearchTeamStatus, ApplicationStatus, AcademyTrack, PaperReviewStatus, NotificationType, NotificationPriority, PolicyShiftType } from './enums.js';

// ── User ──────────────────────────────────────────────────────────────────────

export interface PublicUser {
  id: string;
  name: string;
  profileImage: string | null;
  level: UserLevel;
  role: UserRole;
  communityName: string | null;
  city: string | null;
  activePoints: number; // Public — drives level display
  // pendingPoints: NEVER included in public DTOs
  commentCount: number;
  verifiedOpinionCount: number;
  createdAt: string;
}

export interface AuthUser extends PublicUser {
  email: string;
  memberType: MemberType;
  pendingPoints: number; // Only in authenticated DTOs — never public
  assignedLeaderId: string | null;
  fieldExpertProfile: FieldExpertPublic | null;
  notificationCount: number;
}

export interface FieldExpertPublic {
  id: string;
  approvedField: string;
  verifiedAt: string | null;
}

// ── News ──────────────────────────────────────────────────────────────────────

export interface NewsStoryCard {
  id: string;
  slug: string;
  title: string;
  aiSummary: string | null;
  summaryStatus: string;
  topics: string[];
  countries: string[];
  publishedAt: string;
  sourceCount: number;
  commentCount: number;
  verifiedOpinionCount: number;
  sources: NewsStorySourcePreview[];
}

export interface NewsStorySourcePreview {
  sourceName: string;
  sourceLogoUrl: string | null;
  originalUrl: string;
  publishedAt: string;
}

export interface NewsStoryFull extends NewsStoryCard {
  sources: NewsStorySourceFull[];
  leaderOpinions: Opinion[];
  expertOpinions: Opinion[];
}

export interface NewsStorySourceFull extends NewsStorySourcePreview {
  id: string;
  originalTitle: string;
  excerpt: string | null;
}

export interface Opinion {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  authorInstitution: string | null;
  publishedAt: string;
}

// ── Comments ──────────────────────────────────────────────────────────────────

export interface CommentDTO {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorLevel: UserLevel;
  targetType: string;
  targetId: string;
  parentId: string | null;
  status: CommentStatus;
  isVerified: boolean; // true only when status === OPINION_VERIFIED
  likesCount: number;
  replyCount: number;
  hasLiked: boolean; // requires auth — false for guests
  opinionPointsRequested: boolean;
  createdAt: string;
  replies?: CommentDTO[];
}

export interface CommentSubmitInput {
  content: string;
  targetType: string;
  targetId: string;
  parentId?: string;
}

// ── Points ────────────────────────────────────────────────────────────────────

export interface PointsSummary {
  activePoints: number;
  pendingPoints: number;  // Only in authenticated responses
  currentLevel: UserLevel;
  pointsToNextLevel: number | null;
  pendingBatches: PendingBatch[];
}

export interface PendingBatch {
  id: string;
  batchPoints: number;
  earnedAt: string;
  expiresAt: string;
  daysRemaining: number;
  state: PointState;
}

// ── Presentations ─────────────────────────────────────────────────────────────

export interface PresentationDTO {
  id: string;
  status: PresentationStatus;
  memberId: string;
  memberName: string;
  leaderId: string;
  leaderName: string;
  requestedAt: string;
  scheduledFor: string | null;
  meetingPlatform: MeetingPlatform | null;
  // meetingLink is NEVER included in list DTOs — only via dedicated endpoint
  leaderDecision: LeaderDecision | null;
  leaderNote: string | null; // decrypted — only for member/leader/admin
  pointsActivated: number;
  pointsCancelled: number;
  canRequestAgain: boolean;  // true from Day 5 if no response
  canEscalate: boolean;      // true from Day 10 if still no response
}

// ── Videos ────────────────────────────────────────────────────────────────────

export interface VideoDTO {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  uploadStatus: VideoUploadStatus;
  encodingStatus: string | null;
  duration: number | null;
  thumbnailUrl: string | null;
  difficultyLevel: VideoDifficulty;
  topicField: string | null;
  discussionBrief: string | null;
  expertBreakdown: string | null; // null until member has commented
  isPublished: boolean;
  viewCount: number;
  commentCount: number;
  isBunnyHosted: boolean;
  externalEmbedType: ExternalEmbedType | null;
}

// ── Knowledge ─────────────────────────────────────────────────────────────────

export interface JournalPaperDTO {
  id: string;
  topicId: string;
  topicName: string;
  title: string;
  authors: string;
  institution: string | null;
  publicationYear: number;
  journalName: string | null;
  abstractOriginal: string;
  abstractSimplified: string | null;
  keyFindings: string[];
  sourceUrl: string | null;
  doi: string | null;
  timelinePosition: number;
  addedAt: string;
}

// ── Foreign Policy ────────────────────────────────────────────────────────────

export interface CountryDTO {
  id: string;
  name: string;
  code: string;
  region: string;
  flagEmoji: string;
  recentEntryCount: number;
  lastUpdatedAt: string | null;
}

export interface ForeignPolicyEntryDTO {
  id: string;
  countryId: string;
  title: string;
  description: string;
  policyArea: string;
  changeType: PolicyShiftType;
  entryDate: string;
  officialSourceUrl: string | null;
  expertAnnotation: string | null;
  annotatedByName: string | null;
  addedAt: string;
}

// ── Research ──────────────────────────────────────────────────────────────────

export interface ResearchTeamDTO {
  id: string;
  name: string;
  field: string;
  paperTitle: string;
  paperAbstract: string | null;
  status: ResearchTeamStatus;
  openSpots: number;
  memberCount: number;
  members: ResearchTeamMemberDTO[];
  canApply: boolean; // requires auth
}

export interface ResearchTeamMemberDTO {
  userId: string;
  name: string;
  role: string;
  joinedAt: string;
}

export interface ApplicationDTO {
  id: string;
  teamId: string;
  userId: string;
  status: ApplicationStatus;
  appliedAt: string;
}

// ── Academy ───────────────────────────────────────────────────────────────────

export interface CourseDTO {
  id: string;
  title: string;
  track: AcademyTrack;
  description: string;
  moduleCount: number;
  completedModules: number; // requires auth
  isEnrolled: boolean;      // requires auth
}

export interface ModuleDTO {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl: string | null;
  order: number;
  isCompleted: boolean;   // requires auth
  isLocked: boolean;      // true if previous module not completed
  quizScore: number | null;
}

// ── Paper Review ──────────────────────────────────────────────────────────────

export interface PaperReviewSubmissionDTO {
  id: string;
  userId: string;
  title: string;
  abstract: string;
  status: PaperReviewStatus;
  submittedAt: string;
  feedbackReport: string | null; // decrypted — only for submission author
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}
