'use client';

import Link from 'next/link';
import { useState } from 'react';

const PENDING_OPINIONS = [
  {
    id: '1',
    author: 'Hassan Ahmed',
    field: 'Geopolitics',
    content: 'The discussion of power transition theory provides a robust framework for understanding structural change...',
    story: 'US-China Rivalry Analysis',
    submittedAt: '2 hours ago',
    comment: 'PENDING_OPINION_REVIEW',
  },
  {
    id: '2',
    author: 'Fatima Khan',
    field: 'Economics',
    content: 'Pakistan\'s fiscal sustainability challenge stems from the inability to increase tax-to-GDP ratio...',
    story: 'Pakistan Economy Analysis',
    submittedAt: '4 hours ago',
    comment: 'PENDING_OPINION_REVIEW',
  },
];

const APPROVED_OPINIONS = [
  {
    id: '3',
    author: 'Muhammad Ali',
    field: 'Economics',
    story: 'IMF Conditionality Framework',
    approvedAt: '1 day ago',
    points: 5,
  },
  {
    id: '4',
    author: 'Aisha Malik',
    field: 'Geopolitics',
    story: 'Taiwan Strait Deterrence',
    approvedAt: '3 days ago',
    points: 5,
  },
];

export default function FieldExpertDashboard() {
  const [selectedOpinion, setSelectedOpinion] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Field Expert Dashboard</h1>
          <p className="text-gray-600">Review opinion submissions in your field: Economics</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-1">2</div>
            <div className="text-sm text-gray-600">Pending Approval</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">47</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">235 pts</div>
            <div className="text-sm text-gray-600">Distributed</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">High</div>
            <div className="text-sm text-gray-600">Expert Rating</div>
          </div>
        </div>

        {/* Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Opinions Pending Your Review</h2>
            <p className="text-gray-600 text-sm mb-6">
              These comments request opinion verification. Review the analysis and decide whether to approve.
            </p>
            <div className="space-y-4">
              {PENDING_OPINIONS.map((opinion) => (
                <div
                  key={opinion.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedOpinion(opinion.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{opinion.author}</h3>
                      <p className="text-sm text-gray-600">
                        {opinion.field} • on "{opinion.story}"
                      </p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      {opinion.submittedAt}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-2">{opinion.content}</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-medium text-sm">
                      ✓ Approve Opinion
                    </button>
                    <button className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-medium text-sm">
                      Request Revision
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Approved Opinions */}
            <h2 className="text-2xl font-bold mb-6 mt-12">Recently Approved</h2>
            <div className="space-y-4">
              {APPROVED_OPINIONS.map((opinion) => (
                <div key={opinion.id} className="bg-green-50 rounded-lg border border-green-200 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{opinion.author}</h3>
                      <p className="text-sm text-gray-600">
                        {opinion.field} • "{opinion.story}"
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded block mb-1">
                        {opinion.approvedAt}
                      </span>
                      <span className="text-sm font-bold text-green-700">+{opinion.points} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Opinion Detail */}
            {selectedOpinion && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
                <h3 className="font-bold text-lg mb-4">Review Details</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="text-gray-600">Author</label>
                    <p className="font-medium">
                      {PENDING_OPINIONS.find((o) => o.id === selectedOpinion)?.author}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600">Field</label>
                    <p className="font-medium">
                      {PENDING_OPINIONS.find((o) => o.id === selectedOpinion)?.field}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600">Story</label>
                    <p className="font-medium">
                      {PENDING_OPINIONS.find((o) => o.id === selectedOpinion)?.story}
                    </p>
                  </div>
                  <div className="border-t pt-4">
                    <label className="text-gray-600">Your Assessment</label>
                    <textarea
                      placeholder="Evaluate the analytical quality, evidence support, and scholarly contribution..."
                      className="w-full mt-2 border border-gray-200 rounded p-2 text-xs"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                      Approve
                    </button>
                    <button className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium text-sm">
                      Request Rev.
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Expert Info */}
            <div className="bg-light-blue rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Your Profile</h3>
              <div className="text-sm space-y-2">
                <div>
                  <label className="text-gray-600">Specialty</label>
                  <p className="font-medium">Development Economics</p>
                </div>
                <div>
                  <label className="text-gray-600">Approval Rate</label>
                  <p className="font-medium">94%</p>
                </div>
                <div>
                  <label className="text-gray-600">Member Since</label>
                  <p className="font-medium">June 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
