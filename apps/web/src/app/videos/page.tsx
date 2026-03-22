'use client';

import Link from 'next/link';

const VIDEOS = [
  {
    id: '1',
    slug: 'understanding-us-china-rivalry',
    title: 'Understanding the US-China Rivalry: A Structural Analysis',
    topic: 'Geopolitics',
    difficulty: 'INTERMEDIATE',
    duration: 3420,
    thumbnail: '🎥',
    description: 'A deep structural analysis of the US-China rivalry using power transition theory.',
  },
  {
    id: '2',
    slug: 'pakistan-economy-structural-crisis',
    title: "Pakistan's Structural Economic Crisis: Beyond the IMF Cycle",
    topic: 'Economics',
    difficulty: 'ADVANCED',
    duration: 4800,
    thumbnail: '📊',
    description: 'An analysis of why Pakistan\'s economy has been stuck in recurring IMF program cycles.',
  },
  {
    id: '3',
    slug: 'maqasid-shariah-modern-governance',
    title: 'Maqasid al-Shariah: Principles for Modern Governance',
    topic: 'Religion',
    difficulty: 'BEGINNER',
    duration: 2760,
    thumbnail: '🕌',
    description: 'A jurisprudential lecture on the objectives of Islamic law and their application to contemporary governance.',
  },
  {
    id: '4',
    slug: 'ai-governance-ethics-muslim-societies',
    title: 'AI Governance and Ethics: What Muslim Societies Need to Know',
    topic: 'Technology',
    difficulty: 'BEGINNER',
    duration: 2580,
    thumbnail: '🤖',
    description: 'A structured introduction to artificial intelligence governance and ethical frameworks.',
  },
  {
    id: '5',
    slug: 'climate-change-muslim-world-vulnerability',
    title: 'Climate Change and the Muslim World: Vulnerability, Justice, and Response',
    topic: 'Environment',
    difficulty: 'INTERMEDIATE',
    duration: 3060,
    thumbnail: '🌍',
    description: 'An environmental policy lecture examining climate vulnerability in Muslim-majority countries.',
  },
  {
    id: '6',
    slug: 'hybrid-warfare-syria-ukraine',
    title: 'Understanding Hybrid Warfare: From Syria to Ukraine',
    topic: 'Security',
    difficulty: 'ADVANCED',
    duration: 3900,
    thumbnail: '⚔️',
    description: 'A security studies lecture on the concept of hybrid warfare in 21st-century conflict.',
  },
  {
    id: '7',
    slug: 'islamic-civilizational-heritage',
    title: 'Islamic Civilizational Heritage: Science, Art, and Architecture of the Golden Age',
    topic: 'Culture',
    difficulty: 'BEGINNER',
    duration: 2880,
    thumbnail: '🏛️',
    description: 'A cultural and historical lecture exploring the intellectual and artistic achievements of Islamic civilization.',
  },
  {
    id: '8',
    slug: 'understanding-sectarianism-sunni-shia',
    title: 'Understanding Sunni-Shia Sectarianism: History, Politics, and Geopolitics',
    topic: 'Society',
    difficulty: 'INTERMEDIATE',
    duration: 3240,
    thumbnail: '🕯️',
    description: 'An objective historical and political analysis of Sunni-Shia relations and contemporary sectarianism.',
  },
];

const DIFFICULTY_COLORS = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-blue-100 text-blue-800',
  ADVANCED: 'bg-purple-100 text-purple-800',
};

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Video Library</h1>
          <p className="text-lg opacity-90">
            In-depth lectures, analytical discussions, and educational content across all major topics.
          </p>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VIDEOS.map((video) => (
            <Link
              key={video.id}
              href={`/videos/${video.slug}`}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <div className="text-6xl">{video.thumbnail}</div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${DIFFICULTY_COLORS[video.difficulty as keyof typeof DIFFICULTY_COLORS]}`}>
                    {video.difficulty}
                  </span>
                  <span className="text-xs text-gray-500">{Math.floor(video.duration / 60)} min</span>
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{video.description}</p>
                <div className="text-sm text-primary font-medium">Watch Video →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
