'use client';

import { useState, forwardRef, type InputHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface GlassInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
  className?: string;
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
};

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, maxLength, showCount = false, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState((props.value as string) || (props.defaultValue as string) || '');

    const hasValue = value.length > 0;
    const isLabelFloating = isFocused || hasValue;

    return (
      <div className={cn('relative w-full', className)}>
        <div className="relative">
          <motion.label
            className={cn(
              'pointer-events-none absolute left-3 text-text-tertiary transition-colors',
              isLabelFloating ? 'text-caption' : 'text-body',
              isFocused && 'text-primary',
              error && 'text-red-400'
            )}
            animate={{
              y: isLabelFloating ? -10 : 8,
              scale: isLabelFloating ? 0.85 : 1,
            }}
            transition={springTransition}
          >
            {label}
          </motion.label>

          <input
            ref={ref}
            {...props}
            maxLength={maxLength}
            className={cn(
              'w-full rounded-md border bg-white/12 px-3 pb-2 pt-5 text-body text-text-primary outline-none',
              '[backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)]',
              isFocused && !error && 'border-primary ring-2 ring-primary/30',
              error ? 'border-red-500 ring-2 ring-red-500/30' : 'border-white/25',
              'focus:border-primary focus:ring-2 focus:ring-primary/30',
              'transition-all'
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setValue(e.target.value);
              props.onChange?.(e);
            }}
          />
        </div>

        <div className="mt-1 flex items-center justify-between">
          <AnimatePresence>
            {error && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-caption text-red-400"
              >
                {error}
              </motion.span>
            )}
          </AnimatePresence>

          {showCount && maxLength && (
            <span className="ml-auto text-caption text-text-tertiary">
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
