'use client';

import { useRouter } from 'next/navigation';
import {
  motion,
  useReducedMotion,
} from 'framer-motion';
import type { Slide } from '@casevault/types';
import Button from '@/components/ui/Button';

/* ─── Props ──────────────────────────────────────────────────────────── */
interface SlideDetailProps {
  slide: Slide;
  relatedSlides: Slide[];
}

/* ─── Component ──────────────────────────────────────────────────────── */
export default function SlideDetail({
  slide,
  relatedSlides,
}: SlideDetailProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="min-h-screen bg-obsidian text-textPrimary">
      {/* ── hero image ────────────────────────────────────────────── */}
      <motion.div
        layoutId={`slide-${slide.id}`}
        className="relative w-full h-[50vh] overflow-hidden"
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {slide.preview_image ? (
          <img
            src={slide.preview_image}
            alt={`Preview of ${slide.title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,245,212,0.08) 0%, rgba(99,102,241,0.12) 100%)',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
      </motion.div>

      {/* ── content ───────────────────────────────────────────────── */}
      <div className="relative max-w-3xl mx-auto px-6 -mt-20 z-10">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* back */}
          <button
            onClick={() => router.back()}
            className="mb-6 text-xs text-textMuted hover:text-textSecondary transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          {/* category chip */}
          <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-medium text-accent mb-3">
            {slide.category}
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            {slide.title}
          </h1>

          <p className="text-sm text-textSecondary mt-2">
            {slide.competition_name}
          </p>

          {/* meta row */}
          <div className="flex items-center gap-4 mt-4 text-xs text-textMuted">
            <span>{slide.year}</span>
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {slide.views} views
            </span>
          </div>

          {/* executive summary */}
          {slide.executive_summary && (
            <div className="mt-8">
              <h2 className="text-xs font-medium uppercase tracking-wider text-textSecondary mb-3">
                Executive Summary
              </h2>
              <p className="text-sm leading-relaxed text-textSecondary/90">
                {slide.executive_summary}
              </p>
            </div>
          )}

          {/* download */}
          <div className="mt-8">
            <a
              href={slide.file_path}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="md">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download PDF
              </Button>
            </a>
          </div>
        </motion.div>

        {/* ── related slides ──────────────────────────────────────── */}
        {relatedSlides.length > 0 && (
          <motion.section
            className="mt-16 pb-16"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-sm font-medium uppercase tracking-wider text-textSecondary mb-6">
              Related Decks
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSlides.map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => router.push(`/slide/${rel.id}`)}
                  className="text-left rounded-xl overflow-hidden border border-border hover:border-borderHi transition-colors"
                  style={{
                    background:
                      'linear-gradient(135deg, #0D1424 0%, #131D33 100%)',
                  }}
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    {rel.preview_image ? (
                      <img
                        src={rel.preview_image}
                        alt={`Preview of ${rel.title}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(0,245,212,0.08) 0%, rgba(99,102,241,0.12) 100%)',
                        }}
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-textPrimary truncate">
                      {rel.title}
                    </p>
                    <p className="text-[11px] text-textMuted mt-0.5">
                      {rel.competition_name} · {rel.year}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}
