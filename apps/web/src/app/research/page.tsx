'use client';

import Link from 'next/link';

const RESEARCH_GROUPS = [
  {
    id: 'group-1',
    name: 'Pakistan Policy Research Consortium',
    description: 'Interdisciplinary analysis of Pakistan\'s political economy, security challenges, and development',
    icon: '🇵🇰',
    memberCount: 12,
    focus: ['Economics', 'Geopolitics', 'Governance'],
  },
  {
    id: 'group-2',
    name: 'Islamic Governance & Ethics Initiative',
    description: 'Exploring Islamic jurisprudential frameworks for contemporary governance and policy analysis',
    icon: '⚖️',
    memberCount: 8,
    focus: ['Religion', 'Governance', 'Ethics'],
  },
];

const TEAMS = [
  {
    id: 'team-1',
    name: 'IMF Conditionality Research Team',
    groupId: 'group-1',
    description: 'Analyzing structural adjustment programs and institutional constraints in Pakistan',
    memberCount: 4,
    maxMembers: 6,
  },
  {
    id: 'team-2',
    name: 'Climate Justice in MENA',
    groupId: 'group-2',
    description: 'Climate vulnerability, adaptation, and Islamic environmental ethics in MENA region',
    memberCount: 3,
    maxMembers: 5,
  },
  {
    id: 'team-3',
    name: 'AI Ethics & Islamic Framework',
    groupId: 'group-2',
    description: 'Developing Islamic ethical frameworks for evaluating AI systems in Muslim societies',
    memberCount: 5,
    maxMembers: 8,
  },
];

const COURSES = [
  {
    id: 'course-1',
    title: 'Foundations of Policy Analysis',
    description: 'Essential frameworks and methods for rigorous policy analysis and evaluation',
    modules: 6,
    enrolled: 24,
  },
];

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Research Ecosystem</h1>
          <p className="text-lg opacity-90">
            Collaborative research groups, specialized teams, and structured learning for intellectual development.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/research"
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium"
          >
            Overview
          </Link>
          <Link
            href="/research/academy"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Academy
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Research Groups */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Research Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RESEARCH_GROUPS.map((group) => (
              <Link
                key={group.id}
                href={`/research/groups/${group.id}`}
                className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-4">{group.icon}</div>
                <h3 className="text-xl font-bold mb-2">{group.name}</h3>
                <p className="text-gray-600 mb-4">{group.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{group.memberCount} members</span>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {group.focus.map((f, i) => (
                      <span key={i} className="bg-light-blue text-primary px-2 py-1 rounded text-xs">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Teams */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Active Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAMS.map((team) => (
              <Link
                key={team.id}
                href={`/research/teams/${team.id}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-bold mb-2">{team.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{team.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Members</span>
                    <span className="font-bold">
                      {team.memberCount}/{team.maxMembers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(team.memberCount / team.maxMembers) * 100}%` }}
                    />
                  </div>
                  {team.memberCount < team.maxMembers && (
                    <button className="text-primary text-sm font-medium mt-3 hover:underline">
                      Apply to join →
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Academy */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Research Academy</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-2">Foundations of Policy Analysis</h3>
            <p className="text-gray-600 mb-6">
              A structured 6-module course covering essential frameworks and methods for rigorous policy analysis.
            </p>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-500">6 modules • 24 enrolled</span>
              <Link
                href="/research/academy"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent"
              >
                View Course →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
