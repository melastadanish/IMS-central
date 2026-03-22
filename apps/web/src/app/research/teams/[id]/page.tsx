'use client';

import Link from 'next/link';

const TEAMS = {
  'team-1': {
    id: 'team-1',
    name: 'IMF Conditionality Research Team',
    groupId: 'group-1',
    groupName: 'Pakistan Policy Research Consortium',
    description: 'Analyzing structural adjustment programs and institutional constraints in Pakistan',
    members: [
      { name: 'Dr. Ayesha Khan', role: 'Lead Researcher', status: 'Active' },
      { name: 'Farhan Ahmed', role: 'Analyst', status: 'Active' },
      { name: 'Zara Malik', role: 'Analyst', status: 'Active' },
      { name: 'Hassan Raza', role: 'Research Assistant', status: 'Active' },
    ],
    maxMembers: 6,
    focus: ['Structural Adjustment', 'Elite Capture', 'Fiscal Sustainability'],
    currentWork:
      'We are conducting a comprehensive analysis of 15 IMF programs in Pakistan (1988-2024), examining why policy conditionality is systematically reversed. Our preliminary findings highlight elite capture, weak institutional autonomy, and misaligned incentives as primary explanatory factors.',
    researchOutputs: [
      { title: 'IMF Conditionalities & Elite Capture in Pakistan', type: 'Working Paper', status: 'Draft' },
      { title: 'Agricultural Tax Reform: A Historical Analysis', type: 'Research Note', status: 'Published' },
    ],
  },
  'team-2': {
    id: 'team-2',
    name: 'Climate Justice in MENA',
    groupId: 'group-2',
    groupName: 'Islamic Governance & Ethics Initiative',
    description: 'Climate vulnerability, adaptation, and Islamic environmental ethics in MENA region',
    members: [
      { name: 'Dr. Tariq Rashid', role: 'Lead Researcher', status: 'Active' },
      { name: 'Layla Hassan', role: 'Analyst', status: 'Active' },
      { name: 'Amina Al-Noor', role: 'Analyst', status: 'Active' },
    ],
    maxMembers: 5,
    focus: ['Climate Vulnerability', 'Islamic Ethics', 'Policy Adaptation'],
    currentWork:
      'This team is examining climate vulnerability in MENA through the dual lens of scientific evidence and Islamic environmental ethics. We are developing a framework that connects maqasid al-shariah (particularly hifz al-biyah, preservation of environment) to climate adaptation policy.',
    researchOutputs: [
      { title: 'Islamic Environmental Ethics and Climate Action', type: 'Journal Article', status: 'Published' },
      { title: 'Water Security in the Eastern Mediterranean', type: 'Research Report', status: 'In Progress' },
    ],
  },
  'team-3': {
    id: 'team-3',
    name: 'AI Ethics & Islamic Framework',
    groupId: 'group-2',
    groupName: 'Islamic Governance & Ethics Initiative',
    description: 'Developing Islamic ethical frameworks for evaluating AI systems in Muslim societies',
    members: [
      { name: 'Dr. Layla Hassan', role: 'Lead Researcher', status: 'Active' },
      { name: 'Khalid Ahmed', role: 'AI Specialist', status: 'Active' },
      { name: 'Fatima Amir', role: 'Ethicist', status: 'Active' },
      { name: 'Omar Mansour', role: 'Analyst', status: 'Active' },
      { name: 'Noor Aziz', role: 'Research Assistant', status: 'Active' },
    ],
    maxMembers: 8,
    focus: ['AI Ethics', 'Islamic Framework', 'Technology Governance'],
    currentWork:
      'We are developing a novel framework for evaluating AI systems through Islamic ethical principles. Our work examines AI bias in face recognition systems used in Muslim-majority countries, algorithmic discrimination in credit and hiring systems, and the compatibility of AI governance with Islamic principles of justice and accountability.',
    researchOutputs: [
      { title: 'Algorithmic Bias in Muslim Contexts', type: 'Journal Article', status: 'In Press' },
      { title: 'Islamic AI Ethics: A Framework', type: 'Working Paper', status: 'Draft' },
      { title: 'Face Recognition Bias Study: MENA Region', type: 'Data Report', status: 'Published' },
    ],
  },
};

export default function TeamPage({ params }: { params: { id: string } }) {
  const team = TEAMS[params.id as keyof typeof TEAMS];

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
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
          <Link href={`/research/groups/${team.groupId}`} className="text-blue-200 hover:text-white mb-4 block">
            ← Back to {team.groupName}
          </Link>
          <h1 className="text-4xl font-bold mb-4">{team.name}</h1>
          <p className="text-lg opacity-90">{team.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Overview */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Current Work</h2>
          <p className="text-gray-700 leading-relaxed mb-6">{team.currentWork}</p>
          <div className="flex gap-4 flex-wrap">
            {team.focus.map((f, i) => (
              <span key={i} className="bg-light-blue text-primary px-3 py-1 rounded-full text-sm font-medium">
                {f}
              </span>
            ))}
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-primary mb-2">
              {team.members.length}/{team.maxMembers}
            </div>
            <div className="text-gray-600 mb-4">Team Members</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${(team.members.length / team.maxMembers) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-light-blue rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-primary mb-2">{team.researchOutputs.length}</div>
            <div className="text-gray-600">Research Outputs</div>
          </div>
        </div>

        {/* Members */}
        <section className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Team Members</h2>
          <div className="space-y-4">
            {team.members.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">{member.status}</span>
              </div>
            ))}
          </div>
          {team.members.length < team.maxMembers && (
            <button className="mt-6 w-full px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-light-blue font-medium">
              Apply to Join Team
            </button>
          )}
        </section>

        {/* Research Outputs */}
        <section className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold mb-6">Research Outputs</h2>
          <div className="space-y-4">
            {team.researchOutputs.map((output, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{output.title}</h3>
                  <span className="text-xs bg-light-blue text-primary px-2 py-1 rounded whitespace-nowrap ml-2">
                    {output.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{output.type}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
