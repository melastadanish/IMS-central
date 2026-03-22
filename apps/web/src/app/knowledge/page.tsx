'use client';

import Link from 'next/link';
import { useState } from 'react';

const KNOWLEDGE_TOPICS = [
  { slug: 'islamic-jurisprudence', name: 'Islamic Jurisprudence', icon: '⚖️', description: 'Fiqh, legal methodology, and scholarly discourse' },
  { slug: 'political-philosophy', name: 'Political Philosophy', icon: '🏛️', description: 'Governance, authority, and political theory' },
  { slug: 'history', name: 'History', icon: '📜', description: 'Historical analysis and civilizational study' },
  { slug: 'economics-policy', name: 'Economics & Policy', icon: '📊', description: 'Economic theory, policy analysis, and development' },
  { slug: 'international-relations', name: 'International Relations', icon: '🌐', description: 'Global governance, diplomacy, and IR theory' },
  { slug: 'science-society', name: 'Science & Society', icon: '🔬', description: 'Scientific literacy, ethics, and societal impact' },
  { slug: 'media-communication', name: 'Media & Communication', icon: '📡', description: 'Journalism, propaganda, and information analysis' },
  { slug: 'philosophy-ethics', name: 'Philosophy & Ethics', icon: '🤔', description: 'Moral philosophy, logic, and ethical frameworks' },
];

export default function KnowledgePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Knowledge Library</h1>
          <p className="text-lg opacity-90">
            Deep intellectual foundations across Islamic jurisprudence, philosophy, history, and contemporary policy.
          </p>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Explore Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {KNOWLEDGE_TOPICS.map((topic) => (
            <Link
              key={topic.slug}
              href={`/knowledge/${topic.slug}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3">{topic.icon}</div>
              <h3 className="font-bold text-lg mb-2">{topic.name}</h3>
              <p className="text-sm text-gray-600">{topic.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
