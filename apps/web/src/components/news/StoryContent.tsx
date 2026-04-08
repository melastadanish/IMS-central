'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { CommentsSection } from '../comments/CommentsSection';

interface Source {
  id: string;
  originalUrl: string;
  excerpt: string;
  source: { name: string; slug: string; logoUrl: string | null; bias: string };
}

interface Opinion {
  id: string;
  content: string;
  publishedAt: string;
  author: { id: string; name: string; username: string; avatarUrl: string | null; level: string };
  authorType: string;
}

interface Story {
  id: string;
  headline: string;
  slug: string;
  summary: string | null;
  summaryStatus: string;
  publishedAt: string;
  viewCount: number;
  topic: { name: string; slug: string; color: string; icon: string } | null;
  countries: { name: string; code: string; flag: string }[];
  sources: Source[];
  opinions: Opinion[];
  _count: { comments: number };
}

interface Props {
  story: Story;
}

export function StoryContent({ story }: Props) {
  const leaderOpinions = story.opinions.filter((o) => o.authorType === 'IMS_LEADER');
  const expertOpinions = story.opinions.filter((o) => o.authorType === 'EXTERNAL_EXPERT');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/news" className="text-blue-200 hover:text-white text-sm mb-4 inline-block">
            ← Back to News
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-4 max-w-4xl">{story.headline}</h1>
          <div className="text-blue-200 text-sm flex flex-wrap gap-4">
            <span>Published {format(new Date(story.publishedAt), 'PPP')}</span>
            <span>{story.viewCount.toLocaleString()} views</span>
            <span>{story._count.comments} comments</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <TagsSection story={story} />
            <SourceLogosStrip sources={story.sources} />
            {story.summary && <AISummaryBox summary={story.summary} />}
            <ExpandableSourcesList sources={story.sources} />
            <CommentsSection storyId={story.id} storyHeadline={story.headline} />
          </div>
          <div className="space-y-6">
            <IMSLeaderOpinionsCard opinions={leaderOpinions} />
            <ExternalExpertOpinionsCard opinions={expertOpinions} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TagsSection({ story }: { story: Story }) {
  return (
    <div className="flex flex-wrap gap-2">
      {story.countries.map((c) => (
        <Link
          key={c.code}
          href={`/news?country=${c.code}`}
          className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-full hover:border-primary hover:text-primary transition-colors"
        >
          {c.flag} {c.name}
        </Link>
      ))}
      {story.topic && (
        <Link
          href={`/news?topic=${story.topic.slug}`}
          className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full hover:bg-accent/20 transition-colors"
        >
          {story.topic.icon} {story.topic.name}
        </Link>
      )}
    </div>
  );
}

function SourceLogosStrip({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap py-3 border-y border-gray-200">
      <span className="text-xs text-gray-500 font-medium">Sources:</span>
      {sources.map((s) => (
        <a
          key={s.id}
          href={s.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-2 py-1 rounded-md hover:border-primary hover:text-primary transition-colors"
        >
          {s.source.logoUrl ? (
            <img src={s.source.logoUrl} alt={s.source.name} className="w-4 h-4 object-contain" />
          ) : (
            <span className="w-4 h-4 bg-gray-200 rounded text-[8px] flex items-center justify-center">{s.source.name.charAt(0)}</span>
          )}
          <span>{s.source.name}</span>
        </a>
      ))}
    </div>
  );
}

function AISummaryBox({ summary }: { summary: string }) {
  return (
    <div className="ai-content rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <span className="text-xs font-bold text-accent uppercase tracking-widest">AI Summary</span>
        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Synthesized from all sources</span>
      </div>
      <p className="text-gray-800 leading-relaxed">{summary}</p>
    </div>
  );
}

function ExpandableSourcesList({ sources }: { sources: Source[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleSources = isExpanded ? sources : sources.slice(0, 3);

  if (sources.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-primary mb-4">All Sources</h2>
      <div className="space-y-3">
        {visibleSources.map((s) => (
          <div key={s.id} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 text-sm">{s.source.name}</span>
              <a
                href={s.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline"
              >
                Read original →
              </a>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{s.excerpt}</p>
          </div>
        ))}
      </div>
      {sources.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-sm text-accent hover:text-primary font-medium"
        >
          {isExpanded ? 'Show less' : `Show all ${sources.length} sources`}
        </button>
      )}
    </section>
  );
}

function IMSLeaderOpinionsCard({ opinions }: { opinions: Opinion[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-primary text-white px-4 py-3">
        <h3 className="font-semibold text-sm">IMS Leader Opinions</h3>
      </div>
      <div className="p-4 space-y-4">
        {opinions.length === 0 ? (
          <p className="text-sm text-gray-500">No leader opinions yet.</p>
        ) : (
          opinions.map((op) => (
            <div key={op.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  {op.author.name.charAt(0)}
                </div>
                <span className="font-medium text-xs text-gray-900">{op.author.name}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{op.content}</p>
              <span className="text-xs text-gray-400 mt-2 block">
                {formatDistanceToNow(new Date(op.publishedAt), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ExternalExpertOpinionsCard({ opinions }: { opinions: Opinion[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-accent text-white px-4 py-3">
        <h3 className="font-semibold text-sm">External Expert Opinions</h3>
      </div>
      <div className="p-4 space-y-4">
        {opinions.length === 0 ? (
          <p className="text-sm text-gray-500">No expert opinions yet.</p>
        ) : (
          opinions.map((op) => (
            <div key={op.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                  {op.author.name.charAt(0)}
                </div>
                <span className="font-medium text-xs text-gray-900">{op.author.name}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{op.content}</p>
              <span className="text-xs text-gray-400 mt-2 block">
                {formatDistanceToNow(new Date(op.publishedAt), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
