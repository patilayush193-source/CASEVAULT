import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { syne, inter } from '@/lib/fonts';
import { AuthProvider } from '@/hooks/useAuth';
import BackgroundCanvas from '@/components/canvas/BackgroundCanvas';
import Navbar from '@/components/ui/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'CaseVault | Case Competition Archive',
  description:
    'A secure, immersive platform for showcasing case competition slide decks',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`}>
      <body className="font-inter antialiased">
        <AuthProvider>
          <BackgroundCanvas />
          <Navbar />
          <main className="relative z-10">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
