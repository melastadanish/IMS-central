'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { Sheet, SheetHeader, SheetTitle, SheetContent, SheetClose } from '../ui/sheet';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    router.push('/');
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const navLinkClass = (href: string) =>
    `block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
      pathname.startsWith(href)
        ? 'bg-light-blue text-primary'
        : 'text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="font-bold text-primary text-lg tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">IMS</span>
            </span>
            <span className="hidden sm:inline">News Central</span>
          </Link>

          {/* Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClass(link.href)}
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
                <div className="hidden lg:flex items-center gap-3 text-sm mr-2">
                  <span className="active-points font-medium">{user.activePoints.toLocaleString()} pts</span>
                  {user.pendingPoints > 0 && (
                    <span className="pending-points font-medium">+{user.pendingPoints} pending</span>
                  )}
                </div>

                {/* Dashboard link */}
                <Link
                  href={`/dashboard/${user.role.toLowerCase().replace('_', '-')}`}
                  className="text-sm text-gray-600 hover:text-primary transition-colors hidden lg:inline"
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </nav>

      {/* Mobile sheet menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Menu</SheetTitle>
          <SheetClose onClick={() => setMobileMenuOpen(false)} />
        </SheetHeader>
        <SheetContent>
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={navLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}

            <div className="my-2 border-t border-gray-100" />

            {user ? (
              <>
                <div className="px-4 py-2 text-sm">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 text-sm">
                  <span className="active-points font-medium">{user.activePoints.toLocaleString()} pts</span>
                  {user.pendingPoints > 0 && (
                    <span className="pending-points font-medium">+{user.pendingPoints} pending</span>
                  )}
                </div>
                <Link
                  href={`/dashboard/${user.role.toLowerCase().replace('_', '-')}`}
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={handleLinkClick}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-accent transition-colors text-center"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
