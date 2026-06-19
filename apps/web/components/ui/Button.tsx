'use client';

import { forwardRef, type ReactNode } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

/* ─── Variant / Size maps ────────────────────────────────────────────── */
const variantStyles = {
  primary:
    'bg-accent text-obsidian font-semibold hover:brightness-110 disabled:opacity-50',
  secondary:
    'bg-surface text-textPrimary border border-border hover:border-borderHi disabled:opacity-50',
  ghost:
    'bg-transparent text-textPrimary hover:bg-surface/40 disabled:opacity-50',
} as const;

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
} as const;

/* ─── Types ──────────────────────────────────────────────────────────── */
type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

/* ─── Spinner ────────────────────────────────────────────────────────── */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? 'h-4 w-4'}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────────────── */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const prefersReducedMotion = useReducedMotion();

    const motionProps = prefersReducedMotion
      ? {}
      : {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
        };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center transition-colors
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...motionProps}
        {...rest}
      >
        {loading && <Spinner />}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
