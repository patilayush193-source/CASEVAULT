'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import type { SlideCategory } from '@casevault/types';

/* ─── Constants ──────────────────────────────────────────────────────── */
const CATEGORIES: readonly (SlideCategory | 'All')[] = [
  'All',
  'Technology',
  'Finance',
  'Healthcare',
  'Marketing',
  'Operations',
  'Sustainability',
  'Other',
] as const;

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most Viewed', value: 'views' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

/* ─── Component ──────────────────────────────────────────────────────── */
export default function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  const activeCategory = (searchParams.get('category') ?? 'All') as
    | SlideCategory
    | 'All';
  const activeSort = (searchParams.get('sort') ?? 'newest') as SortValue;
  const activeYear = searchParams.get('year') ?? '';
  const activeSearch = searchParams.get('search') ?? '';

  const [searchValue, setSearchValue] = useState(activeSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── helper: update URL search params ───────────────────────────── */
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === '' || val === 'All') {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      // always reset to page 1 when filters change
      params.delete('page');
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  /* ── debounced search ───────────────────────────────────────────── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ search: searchValue || null });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  return (
    <div
      className="rounded-2xl p-5 mb-8"
      style={{
        background: 'rgba(13,20,36,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,245,212,0.15)',
      }}
    >
      {/* ── categories ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => updateParams({ category: cat === 'All' ? null : cat })}
            className="relative rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
          >
            {activeCategory === cat && (
              <motion.div
                layoutId={prefersReducedMotion ? undefined : 'activeFilter'}
                className="absolute inset-0 rounded-full border border-accent bg-accent/10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 ${
                activeCategory === cat ? 'text-accent' : 'text-textSecondary'
              }`}
            >
              {cat}
            </span>
          </button>
        ))}
      </div>

      {/* ── second row: sort, year, search ─────────────────────────── */}
      <div className="mt-4 flex flex-wrap items-end gap-4">
        {/* sort */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-textMuted">
            Sort
          </label>
          <select
            value={activeSort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-textPrimary outline-none focus:border-accent"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* year */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-textMuted">
            Year
          </label>
          <input
            type="number"
            placeholder="e.g. 2025"
            value={activeYear}
            onChange={(e) => updateParams({ year: e.target.value || null })}
            className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-textPrimary outline-none focus:border-accent"
          />
        </div>

        {/* search */}
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-[10px] uppercase tracking-wider text-textMuted">
            Search
          </label>
          <input
            type="text"
            placeholder="Search slides…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-textPrimary outline-none focus:border-accent"
          />
        </div>
      </div>
    </div>
  );
}
