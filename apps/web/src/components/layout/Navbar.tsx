'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';

const NAV_LINKS = [
  { href: '/news', label: 'News' },
  { href: '/knowledge', label: 'Knowledge' },
  { href: '/foreign-policy', label: 'Foreign Policy' },
  { href: '/videos', label: 'Videos' },
  { href: '/research', label: 'Research' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="font-bold text-primary text-lg tracking-tight">
          IMS News Central
        </Link>

        {/* Nav links (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-light-blue text-primary'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Points display */}
              <div className="hidden sm:flex items-center gap-3 text-sm mr-2">
                <span className="active-points font-medium">{user.activePoints.toLocaleString()} pts</span>
                {user.pendingPoints > 0 && (
                  <span className="pending-points font-medium">+{user.pendingPoints} pending</span>
                )}
              </div>

              {/* Dashboard link */}
              <Link
                href={`/dashboard/${user.role.toLowerCase().replace('_', '-')}`}
                className="text-sm text-gray-600 hover:text-primary transition-colors hidden sm:inline"
              >
                Dashboard
              </Link>

              {/* Avatar / profile */}
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm cursor-pointer hover:bg-primary/20 transition-colors"
                   title={user.name}>
                {user.name.charAt(0)}
              </div>

              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-primary transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary text-white text-sm px-4 py-1.5 rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-1 overflow-x-auto">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
              pathname.startsWith(link.href)
                ? 'bg-primary text-white'
                : 'text-gray-600 bg-gray-50'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
