import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '../components/providers/QueryProvider';
import { AuthProvider } from '../components/providers/AuthProvider';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'IMS News Central',
    template: '%s | IMS News Central',
  },
  description:
    'The intellectual development platform of the Islamic Messaging System. Engage with global news, expert analysis, and verified opinion commentary.',
  keywords: ['news', 'analysis', 'Islamic', 'geopolitics', 'economics', 'intellectual development'],
  openGraph: {
    siteName: 'IMS News Central',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-gray-900 font-sans antialiased flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
