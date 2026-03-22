import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NewsFeed } from '../../components/news/NewsFeed';

export const metadata: Metadata = {
  title: 'News',
  description: 'Global news with expert analysis and verified commentary.',
};

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold">News Feed</h1>
          <p className="text-blue-200 mt-2">Multi-source coverage with AI-synthesized summaries</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Suspense fallback={<NewsFeedSkeleton />}>
          <NewsFeed />
        </Suspense>
      </div>
    </div>
  );
}

function NewsFeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-full mb-2" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
        </div>
      ))}
    </div>
  );
}
