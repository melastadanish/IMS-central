'use client';

import Link from 'next/link';

const FOOTER_LINKS = {
  Platform: [
    { href: '/news', label: 'News' },
    { href: '/knowledge', label: 'Knowledge' },
    { href: '/foreign-policy', label: 'Foreign Policy' },
    { href: '/videos', label: 'Videos' },
    { href: '/research', label: 'Research' },
  ],
  Community: [
    { href: '/about', label: 'About Us' },
    { href: '/join', label: 'Join IMS' },
    { href: '/contact', label: 'Contact' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-bold text-primary text-lg">
              IMS News Central
            </Link>
            <p className="text-sm text-gray-500 mt-2">
              Your intellectual platform for global affairs analysis.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} IMS News Central. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Built for intellectual discourse</span>
          </div>
        </div>
      </div>
    </footer>
  );
}