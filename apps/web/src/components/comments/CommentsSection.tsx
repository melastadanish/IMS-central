'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../stores/auth.store';
import { apiClient } from '../../lib/api-client';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  status: string;
  isVerified: boolean;
  opinionPointsAwarded: number | null;
  publishedAt: string;
  createdAt: string;
  author: { id: string; name: string; username: string; avatarUrl: string | null; level: string; role: string };
  likeCount: number;
}

interface Props {
  storyId: string;
  storyHeadline: string;
}

export function CommentsSection({ storyId, storyHeadline }: Props) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['comments', storyId, page],
    queryFn: () => apiClient.get<{ success: true; data: Comment[]; pagination: { total: number; hasNext: boolean; hasPrev: boolean; page: number; totalPages: number } }>(
      `/comments?storyId=${storyId}&page=${page}&pageSize=20`,
    ),
  });

  const submitMutation = useMutation({
    mutationFn: (content: string) =>
      apiClient.post('/comments', { storyId, content }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['comments', storyId] });
    },
  });

  const requestPointsMutation = useMutation({
    mutationFn: (commentId: string) =>
      apiClient.post(`/comments/${commentId}/request-points`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', storyId] });
    },
  });

  const comments = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <section>
      <h2 className="text-lg font-semibold text-primary mb-6">
        Community Analysis ({pagination?.total ?? 0})
      </h2>

      {/* Submit form */}
      {user ? (
        <div className="bg-white rounded-xl p-5 border border-gray-200 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Submit your analysis</h3>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share a substantive analytical comment on this story. Comments must be at least 50 characters. Strong analytical comments may be nominated for expert verification."
            rows={5}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-800 focus:outline-none focus:border-accent resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs ${commentText.length < 50 ? 'text-gray-400' : 'text-success'}`}>
              {commentText.length}/50 min characters
            </span>
            <button
              onClick={() => submitMutation.mutate(commentText)}
              disabled={commentText.length < 50 || submitMutation.isPending}
              className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-accent transition-colors"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
          {submitMutation.isSuccess && (
            <p className="text-sm text-success mt-2">Comment submitted for editor review.</p>
          )}
        </div>
      ) : (
        <div className="bg-light-blue rounded-xl p-5 border border-accent/20 mb-6 text-center">
          <p className="text-gray-700 mb-3">Sign in to submit analysis and earn verified points.</p>
          <Link href="/auth/login" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium inline-block hover:bg-accent transition-colors">
            Sign In
          </Link>
        </div>
      )}

      {/* Comments list */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            currentUserId={user?.id}
            onRequestPoints={() => requestPointsMutation.mutate(comment.id)}
            isRequestingPoints={requestPointsMutation.isPending}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:border-primary transition-colors"
          >
            ← Previous
          </button>
          <button
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:border-primary transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}

function CommentCard({
  comment,
  currentUserId,
  onRequestPoints,
  isRequestingPoints,
}: {
  comment: Comment;
  currentUserId?: string;
  onRequestPoints: () => void;
  isRequestingPoints: boolean;
}) {
  const isOwn = comment.author.id === currentUserId;
  const canRequestPoints = isOwn && comment.status === 'PUBLISHED';

  return (
    <div className={`bg-white rounded-xl p-5 border transition-all ${
      comment.isVerified ? 'border-success/30 shadow-sm' : 'border-gray-200'
    }`}>
      {/* Author + checkmark */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {comment.author.name.charAt(0)}
          </div>
          <span className="font-medium text-sm text-gray-900">{comment.author.name}</span>
          <LevelBadge level={comment.author.level} />
          {comment.isVerified && (
            <span className="verified-checkmark text-sm">
              ✅ Verified
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* Content */}
      <p className="text-gray-800 text-sm leading-relaxed">{comment.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">👍 {comment.likeCount}</span>

        {comment.isVerified && comment.opinionPointsAwarded && (
          <span className="text-xs text-amber-600 font-medium">
            +{comment.opinionPointsAwarded} pending points
          </span>
        )}

        {canRequestPoints && (
          <button
            onClick={onRequestPoints}
            disabled={isRequestingPoints}
            className="text-xs text-accent hover:text-primary font-medium ml-auto transition-colors disabled:opacity-40"
          >
            Request Opinion Verification →
          </button>
        )}
      </div>
    </div>
  );
}

function LevelBadge({ level }: { level: string }) {
  const badges: Record<string, { label: string; className: string }> = {
    MEMBER: { label: 'Member', className: 'badge-member' },
    OPINION_LEADER: { label: 'Opinion Leader', className: 'badge-opinion-leader' },
    COMMUNITY_EXPERT: { label: 'Community Expert', className: 'badge-community-expert' },
    RESEARCH_SCHOLAR: { label: 'Research Scholar', className: 'badge-research-scholar' },
  };

  const badge = badges[level] ?? badges['MEMBER']!;

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${badge.className}`}>
      {badge.label}
    </span>
  );
}
