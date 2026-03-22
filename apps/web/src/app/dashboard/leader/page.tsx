'use client';

import Link from 'next/link';
import { useState } from 'react';

const PENDING_PRESENTATIONS = [
  {
    id: '1',
    member: 'Hassan Ahmed',
    topic: 'Power Transition Theory in US-China Relations',
    requestedAt: '5 days ago',
    day: 'Day 5',
    status: 'CAN_RESCHEDULE',
    points: 5,
  },
  {
    id: '2',
    member: 'Fatima Khan',
    topic: 'Pakistan IMF Program Conditionalities',
    requestedAt: '8 days ago',
    day: 'Day 8',
    status: 'CAN_ESCALATE',
    points: 5,
  },
];

const SCHEDULED_PRESENTATIONS = [
  {
    id: '3',
    member: 'Muhammad Ali',
    topic: 'Islamic Environmental Ethics',
    scheduledFor: 'March 28, 2026 • 2:00 PM',
    platform: 'Zoom',
    points: 5,
  },
  {
    id: '4',
    member: 'Aisha Malik',
    topic: 'AI Bias in Face Recognition',
    scheduledFor: 'March 30, 2026 • 3:30 PM',
    platform: 'Google Meet',
    points: 5,
  },
];

const COMPLETED = [
  {
    id: '5',
    member: 'Omar Hassan',
    topic: 'Climate Justice in MENA',
    completedAt: '1 week ago',
    decision: 'APPROVED',
    pointsAwarded: 5,
  },
];

export default function LeaderDashboard() {
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Community Leader Dashboard</h1>
          <p className="text-gray-600">Manage member presentations and verify understanding</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-1">2</div>
            <div className="text-sm text-gray-600">Action Required</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">2</div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">8</div>
            <div className="text-sm text-gray-600">Completed (Approved)</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">40 pts</div>
            <div className="text-sm text-gray-600">Distributed</div>
          </div>
        </div>

        {/* Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Pending Action */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Presentations Pending Action</h2>
              <div className="space-y-4">
                {PENDING_PRESENTATIONS.map((pres) => (
                  <div
                    key={pres.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
                    onClick={() => setSelectedPresentation(pres.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{pres.member}</h3>
                        <p className="text-sm text-gray-600">{pres.topic}</p>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded whitespace-nowrap ml-2">
                        {pres.day}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Requested {pres.requestedAt} • {pres.points} pending points
                    </p>
                    <div className="flex gap-3">
                      {pres.status === 'CAN_RESCHEDULE' && (
                        <>
                          <button
                            onClick={() => setShowScheduleForm(true)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent font-medium text-sm"
                          >
                            Schedule Meeting
                          </button>
                          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                            Remind Member
                          </button>
                        </>
                      )}
                      {pres.status === 'CAN_ESCALATE' && (
                        <>
                          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent font-medium text-sm">
                            Schedule Meeting
                          </button>
                          <button className="px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-light-blue text-sm">
                            Escalate
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Scheduled */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Scheduled Presentations</h2>
              <div className="space-y-4">
                {SCHEDULED_PRESENTATIONS.map((pres) => (
                  <div key={pres.id} className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{pres.member}</h3>
                        <p className="text-sm text-gray-600">{pres.topic}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {pres.platform}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {pres.scheduledFor} • {pres.points} pending points
                    </p>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                        View Meeting Link
                      </button>
                      <button className="px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 text-sm">
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Completed */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Recently Completed</h2>
              <div className="space-y-4">
                {COMPLETED.map((item) => (
                  <div key={item.id} className="bg-green-50 rounded-lg border border-green-200 p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{item.member}</h3>
                        <p className="text-sm text-gray-600">{item.topic}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded block mb-1">
                          {item.completedAt}
                        </span>
                        <span className="text-sm font-bold text-green-700">
                          {item.decision === 'APPROVED' ? '✓ Approved' : '✕ Cancelled'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule Form */}
            {showScheduleForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
                <h3 className="font-bold text-lg mb-4">Schedule Presentation</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-gray-600 mb-1">Member</label>
                    <select className="w-full border border-gray-200 rounded p-2">
                      <option>Hassan Ahmed</option>
                      <option>Fatima Khan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Platform</label>
                    <select className="w-full border border-gray-200 rounded p-2">
                      <option>Zoom</option>
                      <option>Google Meet</option>
                      <option>Microsoft Teams</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Meeting Link</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full border border-gray-200 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Date & Time</label>
                    <input type="datetime-local" className="w-full border border-gray-200 rounded p-2" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-accent font-medium">
                      Schedule
                    </button>
                    <button
                      onClick={() => setShowScheduleForm(false)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Guidelines */}
            <div className="bg-light-blue rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Leader Responsibilities</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✓ Schedule timely presentations</li>
                <li>✓ Assess genuine understanding</li>
                <li>✓ Make approve/cancel decision</li>
                <li>✓ Document decision rationale</li>
                <li>✓ Manage escalations</li>
              </ul>
            </div>

            {/* Leader Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Your Impact</h3>
              <div className="text-sm space-y-2">
                <div>
                  <label className="text-gray-600">Members Led</label>
                  <p className="font-medium text-lg text-primary">12</p>
                </div>
                <div>
                  <label className="text-gray-600">Presentations Completed</label>
                  <p className="font-medium text-lg">8</p>
                </div>
                <div>
                  <label className="text-gray-600">Approval Rate</label>
                  <p className="font-medium text-lg">100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
