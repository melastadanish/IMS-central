export const MEETING_PLATFORMS = ['ZOOM', 'GOOGLE_MEET', 'TEAMS', 'OTHER'] as const;
export type MeetingPlatform = typeof MEETING_PLATFORMS[number];
