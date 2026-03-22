'use client';

import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { CommentsSection } from '../comments/CommentsSection';

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
  sources: {
    id: string;
    originalUrl: string;
    excerpt: string;
    source: { name: string; slug: string; logoUrl: string | null; bias: string };
  }[];
  opinions: {
    id: string;
    content: string;
    publishedAt: string;
    author: { id: string; name: string; username: string; avatarUrl: string | null; level: string };
  }[];
  _count: { comments: number };
}

interface Props {
  story: Story;
}

export function StoryContent({ story }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/news" className="text-blue-200 hover:text-white text-sm mb-4 inline-block">
            ← Back to News
          </Link>

          <div className="flex gap-2 mb-4 flex-wrap">
            {story.topic && (
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                {story.topic.icon} {story.topic.name}
              </span>
            )}
            {story.countries.map((c) => (
              <span key={c.code} className="text-xs bg-white/10 text-blue-100 px-2 py-1 rounded-full">
                {c.flag} {c.name}
              </span>
            ))}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">{story.headline}</h1>

          <div className="text-blue-200 text-sm flex gap-4 flex-wrap">
            <span>Published {format(new Date(story.publishedAt), 'PPP')}</span>
            <span>{story.viewCount.toLocaleString()} views</span>
            <span>{story._count.comments} comments</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* AI Summary */}
        {story.summary && (
          <div className="ai-content rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">AI-Generated Summary</span>
              <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Neutral synthesis</span>
            </div>
            <p className="text-gray-800 leading-relaxed">{story.summary}</p>
          </div>
        )}

        {/* Sources */}
        {story.sources.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-primary mb-4">Source Coverage</h2>
            <div className="space-y-4">
              {story.sources.map((s) => (
                <div key={s.id} className="bg-white rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">{s.source.name}</span>
                    <a
                      href={s.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline"
                    >
                      Read original →
                    </a>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.excerpt}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Expert opinions */}
        {story.opinions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-primary mb-4">Expert Opinions</h2>
            <div className="space-y-4">
              {story.opinions.map((op) => (
                <div key={op.id} className="bg-white rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {op.author.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{op.author.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{formatDistanceToNow(new Date(op.publishedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{op.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comments */}
        <CommentsSection storyId={story.id} storyHeadline={story.headline} />
      </div>
    </div>
  );
}
