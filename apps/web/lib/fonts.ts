import { Syne, Inter } from 'next/font/google';

export const syne = Syne({
  weight: ['700', '800'],
  display: 'swap',
  variable: '--font-syne',
  subsets: ['latin'],
});

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
