import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Mona_Sans } from 'next/font/google';

import InAppBrowserGate from '@/components/InAppBrowserGate';  // ⬅️ new import
import './globals.css';

const monaSans = Mona_Sans({
  variable: '--font-mona-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MOCKLY',
  description: 'AI-Powered Interview Mastery',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased pattern`}>
        {/* gate runs only on the client */}
        <InAppBrowserGate />

        {children}
        <Toaster />
      </body>
    </html>
  );
}
