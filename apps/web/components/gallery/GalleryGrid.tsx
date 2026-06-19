'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion';
import type { Slide, SlideCategory, SlideQueryParams } from '@casevault/types';
import { useSlides } from '@/hooks/useSlides';
import FilterPanel from '@/components/gallery/FilterPanel';
import SlideCard from '@/components/gallery/SlideCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import Button from '@/components/ui/Button';

/* ─── Magnetic Pull Config ───────────────────────────────────────────── */
const MAX_DISPLACEMENT = 18;
const FALLOFF = 150;
const MAX_DISTANCE = 300;

/* ─── Props ──────────────────────────────────────────────────────────── */
interface GalleryGridProps {
  initialSlides?: Slide[];
}

/* ─── Component ──────────────────────────────────────────────────────── */
export default function GalleryGrid({ initialSlides }: GalleryGridProps) {
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  /* ── parse URL params into query ────────────────────────────────── */
  const params: SlideQueryParams = useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: 12,
      search: searchParams.get('search') ?? undefined,
      category: (searchParams.get('category') as SlideCategory) ?? undefined,
      sort: (searchParams.get('sort') as SlideQueryParams['sort']) ?? 'newest',
      year: searchParams.get('year')
        ? Number(searchParams.get('year'))
        : undefined,
    }),
    [searchParams],
  );

  const { slides, pagination, loading, error, setParams } = useSlides();

  /* ── sync URL params → hook ─────────────────────────────────────── */
  useEffect(() => {
    setParams(params);
  }, [params, setParams]);

  /* ── touch device detection ─────────────────────────────────────── */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(hover: none)').matches);
    }
  }, []);

  /* ── magnetic pull handler (DOM-based, no hooks in loops) ────────── */
  const handleGridMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isTouchDevice || prefersReducedMotion) return;
      const gridEl = gridRef.current;
      if (!gridEl) return;

      const cards = gridEl.querySelectorAll<HTMLDivElement>('[data-card-idx]');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > MAX_DISTANCE) {
          card.style.transform = 'translate(0px, 0px)';
          return;
        }

        const strength = MAX_DISPLACEMENT / (dist + FALLOFF);
        const tx = dx * strength;
        const ty = dy * strength;
        card.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
      });
    },
    [isTouchDevice, prefersReducedMotion],
  );

  const handleGridMouseLeave = useCallback(() => {
    const gridEl = gridRef.current;
    if (!gridEl) return;
    const cards = gridEl.querySelectorAll<HTMLDivElement>('[data-card-idx]');
    cards.forEach((card) => {
      card.style.transform = 'translate(0px, 0px)';
    });
  }, []);

  /* ── pagination helpers ─────────────────────────────────────────── */
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? 1;

  const goToPage = useCallback(
    (page: number) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set('page', String(page));
      window.history.pushState(null, '', `?${p.toString()}`);
      setParams({ ...params, page });
    },
    [searchParams, setParams, params],
  );

  /* ── resolve data source ────────────────────────────────────────── */
  const displaySlides = slides ?? initialSlides ?? [];

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <section className="w-full">
      <FilterPanel />

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div
        ref={gridRef}
        className="grid gap-6"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        }}
        onMouseMove={handleGridMouseMove}
        onMouseLeave={handleGridMouseLeave}
      >
        <AnimatePresence mode="popLayout">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} tall={(i + 1) % 4 === 0} />
              ))
            : displaySlides.map((slide, i) => (
                <div
                  key={slide.id}
                  data-card-idx={i}
                  style={{ transition: 'transform 0.15s ease-out' }}
                >
                  <SlideCard slide={slide} index={i} />
                </div>
              ))}
        </AnimatePresence>
      </div>

      {/* ── pagination ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            ←
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === currentPage ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => goToPage(p)}
            >
              {p}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            →
          </Button>
        </nav>
      )}
    </section>
  );
}
