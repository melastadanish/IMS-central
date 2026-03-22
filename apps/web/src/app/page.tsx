import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            IMS News Central
          </h1>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl">
            Engage with global affairs through verified analysis, expert commentary, and intellectual development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/news"
              className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Browse News
            </Link>
            <Link
              href="/auth/register"
              className="inline-block border border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-primary mb-10 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Link key={f.href} href={f.href} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-accent hover:shadow-md transition-all group">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-lg text-primary group-hover:text-accent transition-colors mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    icon: '📰',
    title: 'News Aggregator',
    href: '/news',
    description: 'Multi-source news with AI-synthesized summaries and expert opinion commentary.',
  },
  {
    icon: '📚',
    title: 'Knowledge Library',
    href: '/knowledge',
    description: 'Curated academic papers with plain-language simplifications and historical timelines.',
  },
  {
    icon: '🌍',
    title: 'Foreign Policy Tracker',
    href: '/foreign-policy',
    description: 'Country-by-country policy timelines and comparative analysis tools.',
  },
  {
    icon: '🎥',
    title: 'Video Analysis',
    href: '/videos',
    description: 'Curated lectures and documentaries with structured discussion briefs.',
  },
  {
    icon: '🔬',
    title: 'Research Ecosystem',
    href: '/research',
    description: 'Research groups, open teams, academy courses, and peer review.',
  },
  {
    icon: '✅',
    title: 'Verified Commentary',
    href: '/news',
    description: 'Comments verified by field experts and community leaders earn the checkmark and points.',
  },
];
