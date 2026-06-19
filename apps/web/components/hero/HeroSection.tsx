'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

/* ─── Character-split headline ───────────────────────────────────────── */
function SplitHeadline({ text, ready }: { text: string; ready: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  const chars = useMemo(() => text.split(''), [text]);

  // pre-compute stable random Y offsets per character
  const offsets = useMemo(
    () => chars.map(() => Math.floor(Math.random() * 80) - 40),
    [chars],
  );

  return (
    <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none select-none">
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          style={{ fontFamily: 'var(--font-syne, Syne), sans-serif' }}
          initial={
            prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: offsets[i] }
          }
          animate={
            ready && !prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : ready
                ? { opacity: 1 }
                : undefined
          }
          transition={{
            delay: i * 0.025,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </h1>
  );
}

/* ─── Slot-machine number counter ────────────────────────────────────── */
function SlotCounter({
  target,
  ready,
}: {
  target: number;
  ready: boolean;
}) {
  const [display, setDisplay] = useState('00');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ready) return;
    if (prefersReducedMotion) {
      setDisplay(String(target));
      return;
    }

    intervalRef.current = setInterval(() => {
      setDisplay(
        String(Math.floor(Math.random() * 100)).padStart(2, '0'),
      );
    }, 40);

    const snap = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplay(String(target));
    }, 1200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(snap);
    };
  }, [ready, target, prefersReducedMotion]);

  return (
    <span
      className="text-5xl sm:text-6xl md:text-7xl font-bold tabular-nums text-accent"
      style={{ fontFamily: 'var(--font-syne, Syne), sans-serif' }}
    >
      {display}
    </span>
  );
}

/* ─── Marquee Ticker ─────────────────────────────────────────────────── */
function MarqueeTicker() {
  const prefersReducedMotion = useReducedMotion();
  const text =
    'CASE COMPETITION · STRATEGY · FINANCE · OPERATIONS · INNOVATION · ANALYTICS · ';
  const repeated = text.repeat(4);

  return (
    <div className="relative w-full overflow-hidden py-6 border-y border-border/30">
      <div
        className={`whitespace-nowrap text-xs tracking-[0.25em] uppercase text-textMuted ${
          prefersReducedMotion ? '' : 'animate-marquee-scroll'
        }`}
      >
        <span>{repeated}</span>
        <span aria-hidden="true">{repeated}</span>
      </div>
    </div>
  );
}

/* ─── Main HeroSection ───────────────────────────────────────────────── */
export default function HeroSection({
  totalSlides,
}: {
  totalSlides?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  /* ── choreographed timeline state ──────────────────────────────── */
  const [headlineReady, setHeadlineReady] = useState(false);
  const [counterReady, setCounterReady] = useState(false);
  const [subtitleReady, setSubtitleReady] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setHeadlineReady(true);
      setCounterReady(true);
      setSubtitleReady(true);
      return;
    }

    const t1 = setTimeout(() => setHeadlineReady(true), 500);
    const t2 = setTimeout(() => setCounterReady(true), 800);
    const t3 = setTimeout(() => setSubtitleReady(true), 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [prefersReducedMotion]);

  /* ── scroll-locked sticky with parallax ────────────────────────── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);

  return (
    <>
      {/* sticky wrapper — pins for the first viewport of scroll */}
      <div ref={sectionRef} className="relative min-h-[200vh]">
        <motion.section
          className="sticky top-0 flex min-h-screen flex-col items-center justify-center px-6"
          style={
            prefersReducedMotion
              ? {}
              : { opacity: heroOpacity, scale: heroScale }
          }
        >
          {/* coordinate label */}
          <span className="absolute top-6 left-6 text-[11px] font-mono text-textMuted tracking-widest">
            01
          </span>

          {/* headline */}
          <SplitHeadline text="CASE VAULT" ready={headlineReady} />

          {/* counter */}
          <div className="mt-6">
            <SlotCounter
              target={totalSlides ?? 2026}
              ready={counterReady}
            />
          </div>

          {/* subtitle */}
          <motion.p
            className="mt-4 max-w-md text-center text-sm text-textSecondary"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={subtitleReady ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            Curated case competition slide decks from top universities
            and business schools worldwide.
          </motion.p>

          {/* scroll indicator */}
          <motion.div
            className="absolute bottom-10 flex flex-col items-center gap-2 text-textMuted"
            initial={prefersReducedMotion ? { opacity: 0.5 } : { opacity: 0 }}
            animate={subtitleReady ? { opacity: 0.5 } : { opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span className="text-[10px] uppercase tracking-widest">
              Scroll
            </span>
            <motion.div
              className="h-8 w-px bg-textMuted/50"
              animate={
                prefersReducedMotion
                  ? {}
                  : { scaleY: [1, 1.5, 1] }
              }
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </motion.section>
      </div>

      {/* marquee between hero & gallery */}
      <MarqueeTicker />
    </>
  );
}
