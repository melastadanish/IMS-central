'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

export default function DashboardHome() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const roleRoute = user.role.toLowerCase().replace('_', '-');
      router.push(`/dashboard/${roleRoute}`);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading Dashboard...</h1>
        <p className="text-gray-600">Redirecting you to your role-specific dashboard</p>
      </div>
    </div>
  );
}
