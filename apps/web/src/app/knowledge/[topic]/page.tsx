'use client';

import Link from 'next/link';
import { useState } from 'react';

const PAPERS_BY_TOPIC = {
  'islamic-jurisprudence': [
    {
      id: '1',
      title: 'Maqasid al-Shariah and Contemporary Governance: A Jurisprudential Framework',
      authors: ['Dr. Tariq Ramadan', 'Dr. Jasser Auda'],
      journal: 'Journal of Islamic Studies',
      year: 2022,
      doi: '10.1163/15692086-12341456',
      abstract: 'This paper develops a systems-based reading of maqasid al-shariah (the objectives of Islamic law) as a framework for evaluating contemporary governance structures.',
      slug: 'maqasid-al-shariah-contemporary-governance',
    },
  ],
  'political-philosophy': [
    {
      id: '2',
      title: 'Islamic Constitutionalism: Between Shura and Democratic Representation',
      authors: ['Wael Hallaq', 'Khaled Abou El Fadl'],
      journal: 'American Journal of Comparative Law',
      year: 2022,
      doi: '10.1017/islamic.constitutionalism.2022',
      abstract: 'This paper examines whether Islamic political thought contains resources for a genuine theory of constitutional government.',
      slug: 'islamic-constitutionalism-shura-democracy',
    },
  ],
  'history': [
    {
      id: '3',
      title: 'The Abolition of the Ottoman Caliphate: Political Theology and the Crisis of Muslim Authority',
      authors: ['Hasan Kayali', 'Cemil Aydin'],
      journal: 'International Journal of Middle East Studies',
      year: 2021,
      doi: '10.1093/isd/ottoman.caliphate.2021',
      abstract: 'This paper re-examines the 1924 abolition of the Ottoman Caliphate as a political theology event with lasting consequences for Muslim political thought.',
      slug: 'abolition-ottoman-caliphate-political-theology',
    },
  ],
  'economics-policy': [
    {
      id: '4',
      title: 'Structural Adjustment and Elite Capture: Why IMF Conditionalities Fail in Pakistan',
      authors: ['Ayesha Raza Farooq', 'Mehtab Ali Khan'],
      journal: 'Third World Quarterly',
      year: 2023,
      doi: '10.1080/09512748.2023.00054321',
      abstract: 'This paper analyses fifteen IMF programs in Pakistan between 1988 and 2023, identifying systematic patterns of conditionality reversal.',
      slug: 'imf-conditionalities-elite-capture-pakistan',
    },
  ],
  'international-relations': [
    {
      id: '5',
      title: 'Strategic Ambiguity and Deterrence Failure: Lessons from the Taiwan Strait',
      authors: ['James T. Morrison', 'Liu Wei'],
      journal: 'International Organization',
      year: 2023,
      doi: '10.1017/S0020818300012345',
      abstract: 'This paper examines the conditions under which strategic ambiguity as a deterrence posture becomes counterproductive.',
      slug: 'strategic-ambiguity-deterrence-taiwan-strait',
    },
  ],
  'science-society': [
    {
      id: '6',
      title: 'Algorithmic Governance in Muslim-Majority Contexts: AI Bias, Surveillance, and Digital Rights',
      authors: ['Rumman Chowdhury', 'Safiya Umoja Noble', 'Tariq Mustafa'],
      journal: 'Big Data & Society',
      year: 2023,
      doi: '10.1145/ai.algorithmic.bias.muslim.2023',
      abstract: 'This paper examines how artificial intelligence systems deployed in Muslim-majority countries reproduce and amplify existing structural inequalities.',
      slug: 'algorithmic-governance-ai-bias-muslim-contexts',
    },
  ],
  'media-communication': [
    {
      id: '7',
      title: 'Al Jazeera and the Arab Spring: Transnational Media, Network Power, and Selective Coverage',
      authors: ['Mohamed Zayani', 'Noureddine Miladi'],
      journal: 'Media, Culture & Society',
      year: 2021,
      doi: '10.1080/media.arab.spring.al.jazeera.2021',
      abstract: 'This paper interrogates Al Jazeera\'s coverage of the Arab Spring uprisings of 2010-12 through the lens of "network power".',
      slug: 'al-jazeera-arab-spring-media-framing',
    },
  ],
  'philosophy-ethics': [
    {
      id: '8',
      title: 'Adab as Epistemic Virtue: Toward an Islamic Framework for Intellectual Ethics',
      authors: ['Seyyed Hossein Nasr', 'Abdal Hakim Murad'],
      journal: 'Journal of Islamic Philosophy',
      year: 2022,
      doi: '10.1093/philosophy.adab.epistemic.virtue.2022',
      abstract: 'This paper develops the classical Islamic concept of adab as a framework for intellectual ethics.',
      slug: 'adab-epistemic-virtue-islamic-intellectual-ethics',
    },
  ],
};

const TOPIC_NAMES = {
  'islamic-jurisprudence': 'Islamic Jurisprudence',
  'political-philosophy': 'Political Philosophy',
  history: 'History',
  'economics-policy': 'Economics & Policy',
  'international-relations': 'International Relations',
  'science-society': 'Science & Society',
  'media-communication': 'Media & Communication',
  'philosophy-ethics': 'Philosophy & Ethics',
};

export default function TopicPage({ params }: { params: { topic: string } }) {
  const [selectedTab, setSelectedTab] = useState<'papers' | 'timeline'>('papers');
  const papers = PAPERS_BY_TOPIC[params.topic as keyof typeof PAPERS_BY_TOPIC] || [];
  const topicName = TOPIC_NAMES[params.topic as keyof typeof TOPIC_NAMES] || 'Topic';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/knowledge" className="text-blue-200 hover:text-white mb-4 block">
            ← Back to Knowledge
          </Link>
          <h1 className="text-3xl font-bold">{topicName}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-4 border-b border-gray-200 mb-8">
          <button
            onClick={() => setSelectedTab('papers')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              selectedTab === 'papers' ? 'border-primary text-primary' : 'border-transparent text-gray-600'
            }`}
          >
            Papers & Resources
          </button>
          <button
            onClick={() => setSelectedTab('timeline')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              selectedTab === 'timeline' ? 'border-primary text-primary' : 'border-transparent text-gray-600'
            }`}
          >
            Timeline
          </button>
        </div>

        {/* Papers */}
        {selectedTab === 'papers' && (
          <div className="space-y-6">
            {papers.length > 0 ? (
              papers.map((paper) => (
                <div key={paper.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-2">{paper.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{paper.authors.join(', ')}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {paper.journal} • {paper.year} • DOI: {paper.doi}
                  </p>
                  <p className="text-gray-700 mb-4">{paper.abstract}</p>
                  <Link
                    href={`/knowledge/paper/${paper.slug}`}
                    className="text-primary hover:text-accent font-medium"
                  >
                    Read Full Paper →
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No papers found for this topic.</p>
            )}
          </div>
        )}

        {/* Timeline */}
        {selectedTab === 'timeline' && (
          <div className="text-gray-600">
            <p>Historical timeline and key events in {topicName.toLowerCase()} will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
