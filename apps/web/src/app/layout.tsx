import '../styles/globals.css';
import type { Metadata } from 'next';
import AuthProvider from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/lib/query-client';
import Sidebar from '@/components/layout/Sidebar';
import PlayerBar from '@/components/player/PlayerBar';

export const metadata: Metadata = {
  title: 'Harmony — Where Sound Lives on Chain',
  description: 'Stream, own, and earn from music. The decentralized platform for artists and listeners.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
        <AuthProvider>
          <QueryProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto pb-24">{children}</main>
            </div>
            <PlayerBar />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

