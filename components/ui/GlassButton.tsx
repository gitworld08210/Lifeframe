'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface GlassButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
};

const variantStyles: Record<GlassButtonProps['variant'], string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary:
    'border border-white/25 bg-white/12 text-text-primary [backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)]',
  ghost: 'bg-transparent text-text-primary hover:bg-white/10',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizeStyles: Record<NonNullable<GlassButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-label rounded-sm',
  md: 'px-4 py-2 text-body rounded-md',
  lg: 'px-6 py-3 text-title rounded-lg',
};

export function GlassButton({
  variant,
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  className,
  type = 'button',
}: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'pointer-events-none opacity-50',
        className
      )}
      whileTap={{ scale: 0.95 }}
      transition={springTransition}
    >
      {loading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
