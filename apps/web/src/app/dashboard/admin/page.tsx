'use client';

import Link from 'next/link';

const RECENT_USERS = [
  { id: '1', name: 'Hassan Ahmed', role: 'MEMBER', joinedAt: '2 hours ago', status: 'Active' },
  { id: '2', name: 'Fatima Khan', role: 'MEMBER', joinedAt: '1 day ago', status: 'Active' },
  { id: '3', name: 'Muhammad Ali', role: 'FIELD_EXPERT', joinedAt: '3 days ago', status: 'Active' },
];

const SYSTEM_EVENTS = [
  { id: '1', event: 'Points expiry cron job executed', timestamp: 'Today 12:01 AM', status: 'success' },
  { id: '2', event: 'News scraping completed: 12 stories', timestamp: 'Today 11:00 PM', status: 'success' },
  { id: '3', event: 'AI summary generation for 8 stories', timestamp: 'Today 10:45 PM', status: 'success' },
  { id: '4', event: 'Email batch sent: 34 notifications', timestamp: 'Yesterday 6:30 PM', status: 'success' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Full system management and oversight</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">245</div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">8</div>
            <div className="text-sm text-gray-600">Field Experts</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">5</div>
            <div className="text-sm text-gray-600">Community Leaders</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">2</div>
            <div className="text-sm text-gray-600">Platform Managers</div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Users */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Recent Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 font-bold">Name</th>
                      <th className="text-left py-3 font-bold">Role</th>
                      <th className="text-left py-3 font-bold">Joined</th>
                      <th className="text-left py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_USERS.map((user) => (
                      <tr key={user.id} className="border-b border-gray-200 last:border-b-0">
                        <td className="py-3">
                          <button className="text-primary hover:underline">{user.name}</button>
                        </td>
                        <td className="py-3">
                          <span className="text-xs bg-light-blue text-primary px-2 py-1 rounded">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600">{user.joinedAt}</td>
                        <td className="py-3">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link href="#" className="text-primary hover:underline mt-4 block font-medium">
                View All Users →
              </Link>
            </div>

            {/* System Events */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-6">Recent System Events</h2>
              <div className="space-y-3">
                {SYSTEM_EVENTS.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-b-0">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <div className="flex-1">
                      <p className="text-gray-700">{event.event}</p>
                      <p className="text-xs text-gray-500">{event.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">User Management</h3>
              <div className="space-y-2">
                <Link href="#" className="block px-4 py-2 bg-light-blue text-primary rounded-lg hover:bg-blue-100 text-center font-medium">
                  Add New User
                </Link>
                <Link href="#" className="block px-4 py-2 bg-light-blue text-primary rounded-lg hover:bg-blue-100 text-center font-medium">
                  View All Users
                </Link>
                <Link href="#" className="block px-4 py-2 bg-light-blue text-primary rounded-lg hover:bg-blue-100 text-center font-medium">
                  Manage Roles
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">Content Management</h3>
              <div className="space-y-2">
                <Link href="#" className="block px-4 py-2 bg-light-blue text-primary rounded-lg hover:bg-blue-100 text-center font-medium">
                  Manage Topics
                </Link>
                <Link href="#" className="block px-4 py-2 bg-light-blue text-primary rounded-lg hover:bg-blue-100 text-center font-medium">
                  News Sources
                </Link>
                <Link href="#" className="block px-4 py-2 bg-light-blue text-primary rounded-lg hover:bg-blue-100 text-center font-medium">
                  Featured Content
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">System Settings</h3>
              <div className="space-y-2">
                <Link href="#" className="block px-4 py-2 bg-light-blue text-primary rounded-lg hover:bg-blue-100 text-center font-medium">
                  Email Configuration
                </Link>
                <Link href="#" className="block px-4 py-2 bg-light-blue text-primary rounded-lg hover:bg-blue-100 text-center font-medium">
                  API Keys
                </Link>
                <Link href="#" className="block px-4 py-2 bg-light-blue text-primary rounded-lg hover:bg-blue-100 text-center font-medium">
                  Backups
                </Link>
              </div>
            </div>

            <div className="bg-light-blue rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-lg mb-4">System Status</h3>
              <div className="text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database</span>
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">API</span>
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Redis Cache</span>
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Storage</span>
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
