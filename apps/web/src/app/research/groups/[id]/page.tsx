'use client';

import Link from 'next/link';

const GROUPS = {
  'group-1': {
    id: 'group-1',
    name: 'Pakistan Policy Research Consortium',
    icon: '🇵🇰',
    description: 'Interdisciplinary analysis of Pakistan\'s political economy, security challenges, and development',
    longDescription: `The Pakistan Policy Research Consortium brings together scholars, analysts, and practitioners focused on understanding Pakistan's complex political economy. Our work spans macroeconomic stabilization, institutional reform, geopolitical positioning, and democratic governance. We combine rigorous academic analysis with engagement on policy-relevant questions.`,
    focus: ['Economics', 'Geopolitics', 'Governance'],
    members: [
      { name: 'Dr. Ayesha Khan', role: 'Founder', field: 'Development Economics' },
      { name: 'Farhan Ahmed', role: 'Senior Analyst', field: 'Foreign Policy' },
      { name: 'Zara Malik', role: 'Member', field: 'Political Economy' },
    ],
    openPositions: 2,
    totalMembers: 12,
  },
  'group-2': {
    id: 'group-2',
    name: 'Islamic Governance & Ethics Initiative',
    icon: '⚖️',
    description: 'Exploring Islamic jurisprudential frameworks for contemporary governance and policy analysis',
    longDescription: `The Islamic Governance & Ethics Initiative develops and applies Islamic jurisprudential frameworks to contemporary governance challenges. We work at the intersection of Islamic law, political theory, and policy analysis, examining how maqasid al-shariah (objectives of Islamic law) can inform approaches to justice, accountability, and institutional design.`,
    focus: ['Religion', 'Governance', 'Ethics'],
    members: [
      { name: 'Dr. Tariq Rashid', role: 'Founder', field: 'Islamic Jurisprudence' },
      { name: 'Layla Hassan', role: 'Senior Analyst', field: 'Governance' },
    ],
    openPositions: 4,
    totalMembers: 8,
  },
};

const TEAMS = {
  'group-1': [
    {
      id: 'team-1',
      name: 'IMF Conditionality Research Team',
      description: 'Analyzing structural adjustment programs and institutional constraints in Pakistan',
      memberCount: 4,
    },
  ],
  'group-2': [
    {
      id: 'team-2',
      name: 'Climate Justice in MENA',
      description: 'Climate vulnerability, adaptation, and Islamic environmental ethics in MENA region',
      memberCount: 3,
    },
    {
      id: 'team-3',
      name: 'AI Ethics & Islamic Framework',
      description: 'Developing Islamic ethical frameworks for evaluating AI systems in Muslim societies',
      memberCount: 5,
    },
  ],
};

export default function GroupPage({ params }: { params: { id: string } }) {
  const group = GROUPS[params.id as keyof typeof GROUPS];
  const groupTeams = TEAMS[params.id as keyof typeof TEAMS] || [];

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Group Not Found</h1>
          <Link href="/research" className="text-primary hover:text-accent">
            ← Back to Research
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/research" className="text-blue-200 hover:text-white mb-4 block">
            ← Back to Research
          </Link>
          <div className="text-6xl mb-4">{group.icon}</div>
          <h1 className="text-4xl font-bold mb-4">{group.name}</h1>
          <p className="text-lg opacity-90">{group.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Overview */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <p className="text-gray-700 leading-relaxed mb-6">{group.longDescription}</p>
          <div className="flex gap-4 flex-wrap">
            {group.focus.map((f, i) => (
              <span key={i} className="bg-light-blue text-primary px-3 py-1 rounded-full text-sm font-medium">
                {f}
              </span>
            ))}
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{group.totalMembers}</div>
            <div className="text-gray-600">Members</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{groupTeams.length}</div>
            <div className="text-gray-600">Active Teams</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-2">{group.openPositions}</div>
            <div className="text-gray-600">Open Positions</div>
          </div>
        </div>

        {/* Teams */}
        {groupTeams.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Active Teams</h2>
            <div className="space-y-4">
              {groupTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/research/teams/${team.id}`}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-bold mb-2">{team.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{team.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{team.memberCount} members</span>
                    <span className="text-primary text-sm font-medium">View Team →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Members */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Core Members</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {group.members.map((member, idx) => (
              <div
                key={idx}
                className="p-6 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{member.field}</p>
                    <span className="inline-block text-xs bg-light-blue text-primary px-2 py-1 rounded">
                      {member.role}
                    </span>
                  </div>
                  <button className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50">
                    Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
