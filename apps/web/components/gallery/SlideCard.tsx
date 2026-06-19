'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import type { Slide } from '@casevault/types';

/* ─── Props ──────────────────────────────────────────────────────────── */
interface SlideCardProps {
  slide: Slide;
  index: number;
}

/* ─── Component ──────────────────────────────────────────────────────── */
export default function SlideCard({
  slide,
  index,
}: SlideCardProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const cardRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [hovered, setHovered] = useState(false);

  /* ── tilt motion values ──────────────────────────────────────────── */
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(rawRotateY, { stiffness: 300, damping: 30 });

  /* ── shine position ────────────────────────────────────────────── */
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(50);

  /* ── touch device detection ─────────────────────────────────────── */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(hover: none)').matches);
    }
  }, []);

  /* ── mouse handlers ─────────────────────────────────────────────── */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isTouchDevice || prefersReducedMotion) return;
      const el = cardRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      rawRotateX.set(-ny * 12); // inverted for natural tilt
      rawRotateY.set(nx * 12);
      shineX.set(((e.clientX - rect.left) / rect.width) * 100);
      shineY.set(((e.clientY - rect.top) / rect.height) * 100);
    },
    [isTouchDevice, prefersReducedMotion, rawRotateX, rawRotateY, shineX, shineY],
  );

  const handleMouseLeave = useCallback(() => {
    rawRotateX.set(0);
    rawRotateY.set(0);
    setHovered(false);
  }, [rawRotateX, rawRotateY]);

  /* ── every 4th card gets double height ──────────────────────────── */
  const isTall = (index + 1) % 4 === 0;

  return (
    <motion.div
      ref={cardRef}
      layoutId={`slide-${slide.id}`}
      className={`relative cursor-pointer select-none overflow-hidden rounded-xl ${
        isTall ? 'row-span-2' : ''
      }`}
      style={{
        perspective: 800,
        rotateX: isTouchDevice || prefersReducedMotion ? 0 : rotateX,
        rotateY: isTouchDevice || prefersReducedMotion ? 0 : rotateY,
        background: 'linear-gradient(135deg, #0D1424 0%, #131D33 100%)',
        border: '1px solid #1E2D4A',
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => router.push(`/slide/${slide.id}`)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* ── shine layer ─────────────────────────────────────────────── */}
      {!isTouchDevice && !prefersReducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: `radial-gradient(600px circle at ${shineX.get()}% ${shineY.get()}%, rgba(255,255,255,0.04), transparent 40%)`,
            opacity: 0.04,
          }}
        />
      )}

      {/* ── preview image / gradient placeholder ────────────────────── */}
      <div className={`relative w-full overflow-hidden ${isTall ? 'aspect-[16/18]' : 'aspect-[16/10]'}`}>
        {slide.preview_image ? (
          <img
            src={slide.preview_image}
            alt={`Preview of ${slide.title}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,245,212,0.08) 0%, rgba(99,102,241,0.12) 100%)',
            }}
          />
        )}
      </div>

      {/* ── card body ───────────────────────────────────────────────── */}
      <div className="relative z-20 p-4">
        <h3 className="text-sm font-semibold text-textPrimary truncate">
          {slide.title}
        </h3>
        <p className="text-xs text-textSecondary mt-0.5 truncate">
          {slide.competition_name}
        </p>

        <div className="flex items-center gap-3 mt-2 text-[11px] text-textMuted">
          <span>{slide.year}</span>
          <span className="flex items-center gap-1">
            <svg
              className="w-3 h-3"
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
            {slide.views}
          </span>
        </div>
      </div>

      {/* ── hover metadata overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {hovered && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 z-30 flex flex-col justify-end p-4 bg-gradient-to-t from-obsidian/90 via-obsidian/60 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              className="inline-block w-fit rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              {slide.category}
            </motion.span>
            <motion.span
              className="mt-1 text-[11px] text-textSecondary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              {slide.year}
            </motion.span>
            {slide.executive_summary && (
              <motion.p
                className="mt-1 text-[11px] leading-relaxed text-textMuted line-clamp-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {slide.executive_summary.slice(0, 100)}
                {slide.executive_summary.length > 100 ? '…' : ''}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
