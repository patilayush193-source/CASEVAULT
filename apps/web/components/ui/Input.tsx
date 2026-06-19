'use client';

import { forwardRef } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

interface InputProps extends Omit<HTMLMotionProps<'input'>, 'ref'> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...rest }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium tracking-wider uppercase text-textSecondary"
          >
            {label}
          </label>
        )}

        <motion.input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-surface border rounded-lg px-4 py-2.5 text-sm
            text-textPrimary placeholder:text-textMuted
            outline-none transition-colors
            ${
              error
                ? 'border-red-500 focus:border-red-400'
                : 'border-border focus:border-accent'
            }
            ${className}
          `}
          animate={
            prefersReducedMotion
              ? undefined
              : error
                ? { x: [0, -4, 4, -2, 2, 0] }
                : undefined
          }
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          {...rest}
        />

        {error && (
          <motion.p
            className="text-xs text-red-400"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
