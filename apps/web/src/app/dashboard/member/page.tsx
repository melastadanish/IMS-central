'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';

export default function MemberDashboard() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Member Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>

        {/* Points Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-sm text-gray-600 mb-2">Active Points</div>
            <div className="text-5xl font-bold text-primary mb-4">{user.activePoints}</div>
            <p className="text-gray-600 text-sm">
              Verified through presentations. These determine your member level.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-sm text-gray-600 mb-2">Pending Points</div>
            <div className="text-5xl font-bold text-amber-600 mb-4">{user.pendingPoints}</div>
            <p className="text-gray-600 text-sm">
              Awaiting presentation for activation. These expire after 60 days.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">8</div>
            <div className="text-sm text-gray-600">Comments Posted</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">3</div>
            <div className="text-sm text-gray-600">Verified Comments</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">2</div>
            <div className="text-sm text-gray-600">Presentations Done</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">1</div>
            <div className="text-sm text-gray-600">Team Membership</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg">Comment Verified: US-China Rivalry</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Checkmark ✓</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Your analysis on power transition theory was approved by both expert and leader.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>2 days ago</span>
                  <span className="text-primary font-medium">+5 pending points</span>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg">Presentation Scheduled</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Upcoming</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Your presentation on Pakistan's economic crisis is scheduled for March 28, 2026 at 2:00 PM.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Scheduled for 5 days from now</span>
                  <Link href="#" className="text-primary font-medium hover:underline">View Details →</Link>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg">Pending Points Expiration Warning</h3>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Warning</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Your 5 pending points from "Islamic Finance" comment will expire on April 10, 2026 if not activated by presentation.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>18 days to schedule presentation</span>
                  <span className="text-amber-600 font-medium">Act Now →</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/news"
                  className="block px-4 py-2 bg-light-blue text-primary rounded-lg hover:bg-blue-100 font-medium text-center"
                >
                  Browse & Comment
                </Link>
                <Link
                  href="#"
                  className="block px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent font-medium text-center"
                >
                  Request Presentation
                </Link>
              </div>
            </div>

            {/* Member Resources */}
            <div className="bg-light-blue rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-primary hover:underline font-medium">
                    📖 How Points Work
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline font-medium">
                    🎥 Writing Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline font-medium">
                    ⏱️ Level Progression
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline font-medium">
                    ❓ FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Stats Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Member Since</h3>
              <p className="text-gray-600 text-sm mb-3">December 15, 2024</p>
              <div className="text-xs text-gray-500 space-y-2">
                <div>
                  <span className="text-gray-700">Member Level:</span>
                  <span className="ml-2 font-bold text-primary">Standard Member</span>
                </div>
                <div>
                  <span className="text-gray-700">Total Comments:</span>
                  <span className="ml-2 font-bold">8</span>
                </div>
                <div>
                  <span className="text-gray-700">Lifetime Points:</span>
                  <span className="ml-2 font-bold text-primary">18</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
