import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '../components/providers/QueryProvider';
import { AuthProvider } from '../components/providers/AuthProvider';
import { Navbar } from '../components/layout/Navbar';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-white text-gray-900 font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
