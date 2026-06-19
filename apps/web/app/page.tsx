import { Suspense } from 'react';
import type { PaginatedResponse, Slide } from '@casevault/types';
import HeroSection from '@/components/hero/HeroSection';
import GalleryGrid from '@/components/gallery/GalleryGrid';

/* ─── SSR Data Fetch ─────────────────────────────────────────────────── */
async function getInitialSlides(): Promise<PaginatedResponse<Slide> | null> {
  try {
    const res = await fetch('http://localhost:4000/api/slides?limit=12', {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PaginatedResponse<Slide>;
  } catch {
    return null;
  }
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default async function HomePage() {
  const result = await getInitialSlides();

  return (
    <main className="relative min-h-screen bg-obsidian text-textPrimary overflow-x-hidden">
      {/* ── Section 01: Hero ──────────────────────────────────────── */}
      <HeroSection totalSlides={result?.pagination.total} />

      {/* ── Section 02: Gallery ───────────────────────────────────── */}
      <section className="relative px-4 sm:px-8 lg:px-16 py-16 max-w-[1440px] mx-auto">
        <span className="absolute top-6 left-6 text-[11px] font-mono text-textMuted tracking-widest">
          02
        </span>

        <h2 className="text-xl font-semibold text-textPrimary mb-8">
          Browse Decks
        </h2>

        <Suspense fallback={null}>
          <GalleryGrid initialSlides={result?.data} />
        </Suspense>
      </section>

      {/* ── Section 03: Footer ────────────────────────────────────── */}
      <footer className="relative border-t border-border/30 py-12 px-4 sm:px-8 lg:px-16 text-center">
        <span className="absolute top-6 left-6 text-[11px] font-mono text-textMuted tracking-widest">
          03
        </span>
        <p className="text-xs text-textMuted">
          © {new Date().getFullYear()} CaseVault. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
