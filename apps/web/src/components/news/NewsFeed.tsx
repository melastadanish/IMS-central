'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../../lib/api-client';
import { formatDistanceToNow } from 'date-fns';
import { 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  X, 
  Sparkles, 
  Globe, 
  Clock,
  MessageSquare,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Topic {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  _count?: { stories: number };
}

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
}

interface Source {
  sourceName: string;
  sourceLogoUrl: string | null;
  originalUrl: string;
}

interface NewsStory {
  id: string;
  headline: string;
  slug: string;
  summary: string | null;
  summaryStatus: string;
  publishedAt: string;
  viewCount: number;
  topic: Topic | null;
  countries: Country[];
  sources: Source[];
  _count: { comments: number };
  hasLeaderOpinion: boolean;
  hasExpertOpinion: boolean;
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
  data: Topic[];
}

interface CountriesResponse {
  success: true;
  data: Country[];
}

interface FilterState {
  topics: string[];
  country: string;
  dateFrom: string;
  dateTo: string;
  hasLeaderOpinion: boolean;
  hasExpertOpinion: boolean;
}

const TOPIC_ICONS: Record<string, string> = {
  geopolitics: '🌍',
  economics: '📈',
  security: '🔒',
  technology: '💻',
  energy: '⚡',
  environment: '🌿',
  health: '🏥',
  culture: '🎭',
};

export function NewsFeed() {
  const [filters, setFilters] = useState<FilterState>({
    topics: [],
    country: '',
    dateFrom: '',
    dateTo: '',
    hasLeaderOpinion: false,
    hasExpertOpinion: false,
  });
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data: topicsData } = useQuery({
    queryKey: ['news-topics'],
    queryFn: () => apiClient.get<TopicsResponse>('/news/topics'),
    staleTime: 60 * 60 * 1000,
  });

  const { data: countriesData } = useQuery({
    queryKey: ['news-countries'],
    queryFn: () => apiClient.get<CountriesResponse>('/news/countries'),
    staleTime: 60 * 60 * 1000,
  });

  const buildParams = useCallback((page: number = 1) => {
    const params = new URLSearchParams({ page: String(page), pageSize: '12' });
    if (activeTopic) params.set('topic', activeTopic);
    if (filters.country) params.set('country', filters.country);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.hasLeaderOpinion) params.set('hasLeaderOpinion', 'true');
    if (filters.hasExpertOpinion) params.set('hasExpertOpinion', 'true');
    if (filters.topics.length > 0) params.set('topics', filters.topics.join(','));
    return params.toString();
  }, [activeTopic, filters]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['news-stories', activeTopic, filters],
    queryFn: ({ pageParam = 1 }) => apiClient.get<FeedResponse>(`/news/stories?${buildParams(pageParam)}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
  });

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const topics = topicsData?.data ?? [];
  const countries = countriesData?.data ?? [];
  const stories = data?.pages.flatMap((page) => page.data) ?? [];

  const handleTopicToggle = (slug: string) => {
    setFilters((prev) => ({
      ...prev,
      topics: prev.topics.includes(slug)
        ? prev.topics.filter((t) => t !== slug)
        : [...prev.topics, slug],
    }));
  };

  const clearFilters = () => {
    setFilters({
      topics: [],
      country: '',
      dateFrom: '',
      dateTo: '',
      hasLeaderOpinion: false,
      hasExpertOpinion: false,
    });
    setActiveTopic('');
  };

  const hasActiveFilters = filters.topics.length > 0 || filters.country || filters.dateFrom || filters.dateTo || filters.hasLeaderOpinion || filters.hasExpertOpinion;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sticky Topic Navigation */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg"
        >
          <span className="flex items-center gap-2 font-medium">
            <Filter className="w-4 h-4" />
            Filters
          </span>
          <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
        </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={cn(
        'lg:w-64 flex-shrink-0 space-y-6',
        showFilters || sidebarOpen ? 'block' : 'hidden lg:block'
      )}>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-accent hover:underline">
                Clear all
              </button>
            )}
          </div>

          {/* Topic Checkboxes */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Topics</h4>
            <div className="space-y-2">
              {topics.map((topic) => (
                <label key={topic.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.topics.includes(topic.slug)}
                    onChange={() => handleTopicToggle(topic.slug)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">
                    {topic.icon} {topic.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Country Dropdown */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Country</h4>
            <select
              value={filters.country}
              onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Date Range</h4>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                placeholder="From"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                placeholder="To"
              />
            </div>
          </div>

          {/* Opinion Toggles */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Opinion Types</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasLeaderOpinion}
                onChange={(e) => setFilters((prev) => ({ ...prev, hasLeaderOpinion: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-600">Leader Analysis</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasExpertOpinion}
                onChange={(e) => setFilters((prev) => ({ ...prev, hasExpertOpinion: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-600">Expert Opinions</span>
            </label>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Sticky Topic Navigation Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => { setActiveTopic(''); }}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                !activeTopic 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              All
            </button>
            {topics.slice(0, 8).map((topic) => (
              <button
                key={topic.slug}
                onClick={() => { setActiveTopic(topic.slug); }}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  activeTopic === topic.slug
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {topic.icon} {topic.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse">
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
            No stories found matching your filters.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>

        {/* Infinite Scroll Trigger */}
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more stories...</span>
            </div>
          )}
          {!hasNextPage && stories.length > 0 && (
            <span className="text-sm text-gray-400">No more stories to load</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StoryCard({ story }: { story: NewsStory }) {
  return (
    <Link href={`/news/story/${story.slug}`} className="block bg-white rounded-xl border border-gray-200 hover:border-accent hover:shadow-sm transition-all">
      <div className="p-5">
        {/* Source Logos */}
        {story.sources.length > 0 && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {story.sources.slice(0, 4).map((source, idx) => (
              <a
                key={idx}
                href={source.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600 hover:bg-gray-100"
              >
                {source.sourceLogoUrl ? (
                  <img src={source.sourceLogoUrl} alt={source.sourceName} className="w-4 h-4 object-contain" />
                ) : (
                  <Globe className="w-3 h-3" />
                )}
                <span className="max-w-[80px] truncate">{source.sourceName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
            {story.sources.length > 4 && (
              <span className="px-2 py-1 bg-primary text-white text-xs rounded-full font-medium">
                +{story.sources.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Topic + Countries */}
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

        {/* Headline */}
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 hover:text-primary transition-colors line-clamp-2">
          {story.headline}
        </h3>

        {/* AI Summary Preview */}
        {story.summary && (
          <div className="ai-content rounded-lg p-3 mb-3">
            <div className="flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-xs font-medium text-accent uppercase tracking-wide">AI Summary</span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-3">{story.summary}</p>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(story.publishedAt), { addSuffix: true })}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {story._count.comments}
          </span>
          {story.hasLeaderOpinion && (
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
              Leader
            </span>
          )}
          {story.hasExpertOpinion && (
            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
              Expert
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
