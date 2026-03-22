'use client';

import Link from 'next/link';
import { useState } from 'react';

const ESCALATIONS = [
  {
    id: '1',
    member: 'Hassan Ahmed',
    escalatedAt: '2 days ago',
    reason: 'Day 10 no leader response',
    points: 5,
  },
  {
    id: '2',
    member: 'Fatima Khan',
    escalatedAt: '1 day ago',
    reason: 'Day 10 no leader response',
    points: 5,
  },
];

const EXPERT_APPLICATIONS = [
  {
    id: '1',
    applicant: 'Dr. Yusuf Abdullah',
    field: 'Islamic Jurisprudence',
    credentials: 'PhD Islamic Law, Al-Azhar University',
    status: 'PENDING',
    appliedAt: '5 days ago',
  },
  {
    id: '2',
    applicant: 'Mariam Hassan',
    field: 'Environmental Economics',
    credentials: 'MSc Environmental Economics, LSE',
    status: 'PENDING',
    appliedAt: '3 days ago',
  },
];

const EXPERT_CREDENTIALS = [
  {
    id: '1',
    expert: 'Dr. Ayesha Khan',
    field: 'Development Economics',
    approvedAt: '6 months ago',
    status: 'ACTIVE',
  },
  {
    id: '2',
    expert: 'Dr. Tariq Rashid',
    field: 'Islamic Jurisprudence',
    approvedAt: '4 months ago',
    status: 'ACTIVE',
  },
];

export default function PlatformManagerDashboard() {
  const [selectedEscalation, setSelectedEscalation] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Platform Manager Dashboard</h1>
          <p className="text-gray-600">Manage escalations, expert credentials, and system governance</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">2</div>
            <div className="text-sm text-gray-600">Escalations</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-1">2</div>
            <div className="text-sm text-gray-600">Pending Expert Apps</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">8</div>
            <div className="text-sm text-gray-600">Active Experts</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">245</div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            {/* Escalations */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Escalated Presentations</h2>
              <p className="text-gray-600 text-sm mb-6">
                Members can escalate if their leader doesn't respond within 10 days.
              </p>
              <div className="space-y-4">
                {ESCALATIONS.map((esc) => (
                  <div
                    key={esc.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
                    onClick={() => setSelectedEscalation(esc.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{esc.member}</h3>
                        <p className="text-sm text-gray-600">{esc.reason}</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {esc.escalatedAt}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{esc.points} pending points waiting activation</p>
                    <button
                      onClick={() => setShowAssignForm(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent font-medium text-sm"
                    >
                      Assign to Leader
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Expert Applications */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Expert Credential Applications</h2>
              <p className="text-gray-600 text-sm mb-6">
                Review and approve applications for field expert roles.
              </p>
              <div className="space-y-4">
                {EXPERT_APPLICATIONS.map((app) => (
                  <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{app.applicant}</h3>
                        <p className="text-sm text-gray-600">{app.field}</p>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        {app.appliedAt}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">{app.credentials}</p>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                        Reject
                      </button>
                      <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                        Request More Info
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Active Experts */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Active Experts</h2>
              <div className="space-y-3">
                {EXPERT_CREDENTIALS.map((expert) => (
                  <div key={expert.id} className="bg-green-50 rounded-lg border border-green-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{expert.expert}</h3>
                        <p className="text-sm text-gray-600">{expert.field}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {expert.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Approved {expert.approvedAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assign Form */}
            {showAssignForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
                <h3 className="font-bold text-lg mb-4">Assign Leader</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-gray-600 mb-1">Escalated Member</label>
                    <select className="w-full border border-gray-200 rounded p-2">
                      <option>Hassan Ahmed</option>
                      <option>Fatima Khan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Assign Leader</label>
                    <select className="w-full border border-gray-200 rounded p-2">
                      <option>Ahmad Muhammad (Current: 8 members)</option>
                      <option>Layla Hassan (Current: 6 members)</option>
                      <option>Omar Ahmed (Current: 12 members)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Deadline</label>
                    <input type="date" className="w-full border border-gray-200 rounded p-2" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-accent font-medium">
                      Assign
                    </button>
                    <button
                      onClick={() => setShowAssignForm(false)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* System Health */}
            <div className="bg-light-blue rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">System Health</h3>
              <div className="text-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database</span>
                  <span className="text-green-600 font-bold">✓ Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">API</span>
                  <span className="text-green-600 font-bold">✓ Running</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email Service</span>
                  <span className="text-green-600 font-bold">✓ Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Background Jobs</span>
                  <span className="text-green-600 font-bold">✓ Running</span>
                </div>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Platform Stats</h3>
              <div className="text-sm space-y-2">
                <div>
                  <label className="text-gray-600">Total Points Distributed</label>
                  <p className="font-bold text-lg text-primary">1,245</p>
                </div>
                <div>
                  <label className="text-gray-600">Avg Points Per Member</label>
                  <p className="font-bold text-lg">5.1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
