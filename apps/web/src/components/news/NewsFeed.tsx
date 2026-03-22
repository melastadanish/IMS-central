'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../lib/api-client';
import { formatDistanceToNow } from 'date-fns';

interface NewsStory {
  id: string;
  headline: string;
  slug: string;
  summary: string | null;
  summaryStatus: string;
  publishedAt: string;
  viewCount: number;
  topic: { name: string; slug: string; color: string; icon: string } | null;
  countries: { name: string; code: string; flag: string }[];
  _count: { comments: number };
}

interface FeedResponse {
  success: true;
  data: NewsStory[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface TopicsResponse {
  success: true;
  data: { id: string; name: string; slug: string; icon: string; color: string }[];
}

export function NewsFeed() {
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: topicsData } = useQuery({
    queryKey: ['news-topics'],
    queryFn: () => apiClient.get<TopicsResponse>('/news/topics'),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['news-stories', topicFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (topicFilter) params.set('topic', topicFilter);
      return apiClient.get<FeedResponse>(`/news/stories?${params.toString()}`);
    },
  });

  const topics = topicsData?.data ?? [];
  const stories = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Topic filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setTopicFilter(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !topicFilter ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
          }`}
        >
          All
        </button>
        {topics.map((t) => (
          <button
            key={t.slug}
            onClick={() => { setTopicFilter(t.slug); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              topicFilter === t.slug ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
            }`}
          >
            {t.icon} {t.name}
          </button>
        ))}
      </div>

      {/* Stories */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-600 rounded-xl p-6 border border-red-200">
          Failed to load news. Please try again.
        </div>
      )}

      {!isLoading && stories.length === 0 && (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center text-gray-500">
          No stories found.
        </div>
      )}

      <div className="space-y-4">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-primary transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-primary transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function StoryCard({ story }: { story: NewsStory }) {
  return (
    <Link href={`/news/story/${story.slug}`} className="block bg-white rounded-xl p-6 border border-gray-200 hover:border-accent hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Topic + countries */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {story.topic && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-light-blue text-primary">
                {story.topic.icon} {story.topic.name}
              </span>
            )}
            {story.countries.slice(0, 3).map((c) => (
              <span key={c.code} className="text-xs text-gray-500">
                {c.flag} {c.name}
              </span>
            ))}
          </div>

          <h2 className="font-semibold text-gray-900 text-lg leading-snug mb-2 hover:text-primary transition-colors">
            {story.headline}
          </h2>

          {story.summary && (
            <div className="ai-content rounded-lg p-3 mb-3">
              <span className="text-xs font-medium text-accent uppercase tracking-wide block mb-1">AI Summary</span>
              <p className="text-sm text-gray-700 line-clamp-3">{story.summary}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{formatDistanceToNow(new Date(story.publishedAt), { addSuffix: true })}</span>
            <span>{story.viewCount.toLocaleString()} views</span>
            <span>{story._count.comments} comments</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
