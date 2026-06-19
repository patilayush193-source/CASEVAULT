import { Suspense } from 'react';
import type { PaginatedResponse, Slide } from '@casevault/types';
import GalleryGrid from '@/components/gallery/GalleryGrid';

export const metadata = {
  title: 'Gallery | CaseVault',
  description: 'Browse and discover case competition slide decks',
};

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
export default async function GalleryPage() {
  const result = await getInitialSlides();

  return (
    <main className="min-h-screen pt-24 px-4 sm:px-8 lg:px-16 pb-16">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-10">
          <h1 className="display-lg text-textPrimary">Gallery</h1>
          <p className="text-sm text-textSecondary mt-2">
            Browse, filter, and discover case competition decks from around the world.
          </p>
        </div>

        <Suspense fallback={null}>
          <GalleryGrid initialSlides={result?.data} />
        </Suspense>
      </div>
    </main>
  );
}
