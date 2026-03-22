'use client';

import Link from 'next/link';
import { useState } from 'react';

const VIDEOS = [
  {
    id: '1',
    slug: 'understanding-us-china-rivalry',
    title: 'Understanding the US-China Rivalry: A Structural Analysis',
    topic: 'Geopolitics',
    difficulty: 'INTERMEDIATE',
    duration: 3420,
    thumbnail: '🎥',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'A deep structural analysis of the US-China rivalry using power transition theory.',
    discussionBrief: `This lecture examines the structural factors driving US-China competition. Key themes include:
    - Power transition theory: how rising powers challenge declining ones
    - Economic interdependence: constraints and vulnerabilities
    - Military capabilities: balance of power in the Pacific
    - Alliance systems: hedging strategies of regional partners
    - Technological competition: semiconductors, AI, critical minerals
    - Ideological dimensions: authoritarian vs. liberal governance models

Come prepared with: examples from recent developments (2024-2025), your analysis of likely escalation points, and thoughts on stabilizing mechanisms.`,
  },
  {
    id: '2',
    slug: 'pakistan-economy-structural-crisis',
    title: "Pakistan's Structural Economic Crisis: Beyond the IMF Cycle",
    topic: 'Economics',
    difficulty: 'ADVANCED',
    duration: 4800,
    thumbnail: '📊',
    youtubeId: 'jNQXAC9IVRw',
    description: 'An analysis of why Pakistan\'s economy has been stuck in recurring IMF program cycles.',
    discussionBrief: `This lecture deconstructs Pakistan's economic vulnerabilities through institutional and political economy lenses. Key concepts:
    - Elite capture: why structural reforms never take root
    - Fiscal sustainability: revenue-to-GDP stagnation since 2000
    - External sector: current account deficits and debt servicing
    - Financial system: dollarization and capital flight
    - Agricultural policy: distortions and informality
    - Lessons from comparable cases (Bangladesh, Kenya)

Expected preparation: data on Pakistan's fiscal position, understanding of IMF conditionality frameworks, and your diagnostic of the core constraint blocking reform.`,
  },
  {
    id: '3',
    slug: 'maqasid-shariah-modern-governance',
    title: 'Maqasid al-Shariah: Principles for Modern Governance',
    topic: 'Religion',
    difficulty: 'BEGINNER',
    duration: 2760,
    thumbnail: '🕌',
    youtubeId: 'aqz5tCfXHiQ',
    description: 'A jurisprudential lecture on the objectives of Islamic law and their application to contemporary governance.',
    discussionBrief: `This introductory lecture explores maqasid al-shariah (objectives of Islamic law) as a framework for evaluating governance policies. Topics:
    - The classical five necessities: life, intellect, lineage, property, religion
    - Extensions: dignity, environment, justice as modern necessities
    - Method: how to apply maqasid to policy evaluation
    - Case studies: Islamic finance, family law, environmental regulation
    - Comparative framework: similarities to rights-based governance

Preparation: read one contemporary policy debate, consider how maqasid might evaluate it differently than secular frameworks.`,
  },
  {
    id: '4',
    slug: 'ai-governance-ethics-muslim-societies',
    title: 'AI Governance and Ethics: What Muslim Societies Need to Know',
    topic: 'Technology',
    difficulty: 'BEGINNER',
    duration: 2580,
    thumbnail: '🤖',
    youtubeId: 'ScMzIvxBSi4',
    description: 'A structured introduction to artificial intelligence governance and ethical frameworks.',
    discussionBrief: `An accessible introduction to AI governance challenges relevant to Muslim-majority economies. We'll cover:
    - AI capabilities and limitations: what AI can and cannot do
    - Governance models: regulatory approaches (EU, China, US, emerging markets)
    - Ethical frameworks: bias, transparency, accountability, consent
    - Application domains: hiring, credit scoring, criminal justice, healthcare
    - Islamic ethical frameworks: maqasid-based critique of AI systems
    - Policy priorities for developing economies

No technical prerequisites. Bring: a concern or question about AI and governance you've encountered locally.`,
  },
  {
    id: '5',
    slug: 'climate-change-muslim-world-vulnerability',
    title: 'Climate Change and the Muslim World: Vulnerability, Justice, and Response',
    topic: 'Environment',
    difficulty: 'INTERMEDIATE',
    duration: 3060,
    thumbnail: '🌍',
    youtubeId: 'kH6EVQ6Jzz4',
    description: 'An environmental policy lecture examining climate vulnerability in Muslim-majority countries.',
    discussionBrief: `This lecture examines climate change through the lens of vulnerability, justice, and governance in Muslim-majority countries. Key topics:
    - Climate vulnerability hotspots: MENA, South Asia, Sahel, island states
    - Climate justice: equity between emitters and vulnerable nations
    - Islamic climate ethics: khalifah (stewardship), istislah (public interest)
    - Adaptation strategies: water security, agriculture, migration
    - Mitigation pathways: energy transition in oil-dependent economies
    - Transnational cooperation: climate diplomacy and finance

Preparation: identify one climate-vulnerable region, understand its local vulnerabilities and adaptation needs.`,
  },
];

const DIFFICULTY_COLORS = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-blue-100 text-blue-800',
  ADVANCED: 'bg-purple-100 text-purple-800',
};

interface CommentType {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

const SAMPLE_COMMENTS: CommentType[] = [
  {
    id: '1',
    author: 'Fatima Ahmed',
    avatar: '👩',
    content:
      'Excellent breakdown of structural factors. This helps clarify why bilateral engagement is difficult without addressing the underlying competitive dynamic.',
    timestamp: '2 days ago',
    likes: 24,
  },
  {
    id: '2',
    author: 'Muhammad Hassan',
    avatar: '👨',
    content:
      'The alliance system discussion was particularly insightful. Would love to hear more on how AUKUS and Quad are reshaping regional security architecture.',
    timestamp: '1 day ago',
    likes: 18,
  },
  {
    id: '3',
    author: 'Aisha Malik',
    avatar: '👩',
    content:
      'This provides important context for understanding Pakistan\'s strategic dilemmas in hedging between great powers.',
    timestamp: '12 hours ago',
    likes: 12,
  },
];

export default function VideoPage({ params }: { params: { slug: string } }) {
  const video = VIDEOS.find((v) => v.slug === params.slug);
  const [comments, setComments] = useState<CommentType[]>(SAMPLE_COMMENTS);
  const [newComment, setNewComment] = useState('');

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
          <Link href="/videos" className="text-primary hover:text-accent">
            ← Back to Video Library
          </Link>
        </div>
      </div>
    );
  }

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    const comment: CommentType = {
      id: Date.now().toString(),
      author: 'You',
      avatar: '😊',
      content: newComment,
      timestamp: 'just now',
      likes: 0,
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/videos" className="text-blue-200 hover:text-white mb-4 block">
            ← Back to Video Library
          </Link>
          <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${DIFFICULTY_COLORS[video.difficulty as keyof typeof DIFFICULTY_COLORS]}`}
            >
              {video.difficulty}
            </span>
            <span className="text-sm opacity-90">{Math.floor(video.duration / 60)} minutes</span>
            <span className="text-sm opacity-90">Topic: {video.topic}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-8 aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
            title={video.title}
            allowFullScreen
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">{video.description}</p>
            </section>

            {/* Discussion Brief */}
            <section className="bg-light-blue rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-4">Discussion Brief</h2>
              <div className="text-gray-700 space-y-3">
                {video.discussionBrief.split('\n').map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </section>

            {/* Comments Section */}
            <section className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-6">Structured Discussion</h2>

              {/* Comment Input */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <label className="block text-sm font-bold mb-3">Add your analysis or question</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your insights on the key themes discussed..."
                  className="w-full h-24 border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="mt-3 flex justify-end gap-3">
                  <button
                    onClick={() => setNewComment('')}
                    className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent disabled:opacity-50"
                  >
                    Submit Analysis
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="pb-6 border-b border-gray-200 last:border-b-0">
                    <div className="flex gap-4">
                      <div className="text-3xl">{comment.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold">{comment.author}</h3>
                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-gray-700 mb-3">{comment.content}</p>
                        <button className="text-sm text-gray-500 hover:text-primary">
                          👍 {comment.likes} found this helpful
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Related Videos */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Related Videos</h3>
              <div className="space-y-4">
                {VIDEOS.filter((v) => v.slug !== video.slug)
                  .slice(0, 3)
                  .map((v) => (
                    <Link
                      key={v.id}
                      href={`/videos/${v.slug}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <p className="text-sm font-bold text-primary mb-1 line-clamp-2">{v.title}</p>
                      <p className="text-xs text-gray-500">{v.topic}</p>
                    </Link>
                  ))}
              </div>
            </section>

            {/* Resources */}
            <section className="bg-light-blue rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-primary hover:underline">
                    📖 Reading List
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline">
                    📑 Discussion Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline">
                    🔗 Primary Sources
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
