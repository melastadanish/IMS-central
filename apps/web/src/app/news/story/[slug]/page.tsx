import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StoryContent } from '../../../../components/news/StoryContent';

interface Props {
  params: Promise<{ slug: string }>;
}

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

async function fetchStory(slug: string) {
  const res = await fetch(`${API_URL}/api/v1/news/stories/${slug}`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await fetchStory(slug);
  if (!story) return { title: 'Story not found' };

  return {
    title: story.headline,
    description: story.summary?.slice(0, 160) ?? story.headline,
    openGraph: {
      title: story.headline,
      description: story.summary?.slice(0, 160),
      type: 'article',
      publishedTime: story.publishedAt,
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const story = await fetchStory(slug);

  if (!story) notFound();

  // Fire-and-forget view count increment
  fetch(`${API_URL}/api/v1/news/stories/${slug}/view`, { method: 'POST' }).catch(() => null);

  return <StoryContent story={story} />;
}
