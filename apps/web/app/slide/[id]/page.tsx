import { notFound } from 'next/navigation';
import type { Slide, ApiResponse, PaginatedResponse } from '@casevault/types';
import SlideDetail from '@/components/slide/SlideDetail';

/* ─── SSR Fetch helpers ──────────────────────────────────────────────── */
async function getSlide(id: string): Promise<Slide | null> {
  try {
    const res = await fetch(`http://localhost:4000/api/slides/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<Slide>;
    return json.data ?? null;
  } catch {
    return null;
  }
}

async function getRelatedSlides(
  category: string,
  excludeId: string,
): Promise<Slide[]> {
  try {
    const res = await fetch(
      `http://localhost:4000/api/slides?category=${encodeURIComponent(
        category,
      )}&limit=3`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as PaginatedResponse<Slide>;
    return json.data.filter((s) => s.id !== excludeId).slice(0, 3);
  } catch {
    return [];
  }
}

/* ─── Page ───────────────────────────────────────────────────────────── */
interface PageProps {
  params: { id: string };
}

export default async function SlideDetailPage({ params }: PageProps) {
  const slide = await getSlide(params.id);
  if (!slide) notFound();

  const related = await getRelatedSlides(slide.category, slide.id);

  return <SlideDetail slide={slide} relatedSlides={related} />;
}
