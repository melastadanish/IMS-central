'use client';

import Link from 'next/link';
import { useState } from 'react';

const PENDING_COMMENTS = [
  {
    id: '1',
    author: 'Hassan Ahmed',
    content: 'The discussion of power transition theory provides a robust framework for understanding structural change in international systems...',
    story: 'US-China Rivalry Analysis',
    status: 'PENDING_EDITOR',
    submittedAt: '2 hours ago',
  },
  {
    id: '2',
    author: 'Fatima Khan',
    content: 'Pakistan\'s fiscal sustainability challenge stems from the inability to increase tax-to-GDP ratio despite repeated reform attempts...',
    story: 'Pakistan Economy Analysis',
    status: 'PENDING_EDITOR',
    submittedAt: '4 hours ago',
  },
  {
    id: '3',
    author: 'Muhammad Ali',
    content: 'The maqasid framework offers a jurisprudential approach to evaluating governance structures that differs from secular benchmarks...',
    story: 'Islamic Governance',
    status: 'PENDING_EDITOR',
    submittedAt: '6 hours ago',
  },
];

const APPROVED_COMMENTS = [
  {
    id: '4',
    author: 'Aisha Malik',
    content: 'Strategic ambiguity as a deterrence doctrine becomes destabilizing when military capabilities reach parity...',
    story: 'Taiwan Strait Deterrence',
    approvedAt: '1 day ago',
  },
  {
    id: '5',
    author: 'Omar Hassan',
    content: 'AI bias in face recognition systems disproportionately affects populations from non-Western regions...',
    story: 'AI Governance in Muslim Societies',
    approvedAt: '2 days ago',
  },
];

export default function EditorDashboard() {
  const [selectedComment, setSelectedComment] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Editor Dashboard</h1>
          <p className="text-gray-600">Review and approve member comments</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-1">3</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">142</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">8</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">98%</div>
            <div className="text-sm text-gray-600">Approval Rate</div>
          </div>
        </div>

        {/* Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Comments Pending Review</h2>
            <div className="space-y-4">
              {PENDING_COMMENTS.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedComment(comment.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{comment.author}</h3>
                      <p className="text-sm text-gray-600">on "{comment.story}"</p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      {comment.submittedAt}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-2">{comment.content}</p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-medium text-sm">
                      ✓ Approve
                    </button>
                    <button className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-medium text-sm">
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Approved Comments */}
            <h2 className="text-2xl font-bold mb-6 mt-12">Recently Approved</h2>
            <div className="space-y-4">
              {APPROVED_COMMENTS.map((comment) => (
                <div key={comment.id} className="bg-green-50 rounded-lg border border-green-200 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{comment.author}</h3>
                      <p className="text-sm text-gray-600">on "{comment.story}"</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {comment.approvedAt}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Comment Detail */}
            {selectedComment && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
                <h3 className="font-bold text-lg mb-4">Review Details</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="text-gray-600">Author</label>
                    <p className="font-medium">
                      {PENDING_COMMENTS.find((c) => c.id === selectedComment)?.author}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600">Story</label>
                    <p className="font-medium">
                      {PENDING_COMMENTS.find((c) => c.id === selectedComment)?.story}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600">Submitted</label>
                    <p className="font-medium">
                      {PENDING_COMMENTS.find((c) => c.id === selectedComment)?.submittedAt}
                    </p>
                  </div>
                  <div className="border-t pt-4">
                    <label className="text-gray-600">Editorial Notes</label>
                    <textarea
                      placeholder="Add notes for your own reference (not shown to member)"
                      className="w-full mt-2 border border-gray-200 rounded p-2 text-xs"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                      Approve
                    </button>
                    <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Guidelines */}
            <div className="bg-light-blue rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Review Guidelines</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✓ Evidence-based arguments</li>
                <li>✓ Respectful discourse</li>
                <li>✓ Relevant to topic</li>
                <li>✕ Personal attacks</li>
                <li>✕ Unsubstantiated claims</li>
                <li>✕ Spam or promotion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
