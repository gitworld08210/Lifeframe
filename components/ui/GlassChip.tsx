'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface GlassChipProps {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
};

export function GlassChip({
  label,
  selected = false,
  onSelect,
  className,
}: GlassChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-label font-medium transition-colors',
        selected
          ? 'border border-primary bg-primary/20 text-primary'
          : 'border border-white/25 bg-white/12 text-text-secondary hover:bg-white/20',
        '[backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)]',
        className
      )}
      whileTap={{ scale: 0.95 }}
      animate={selected ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={springTransition}
    >
      {label}
    </motion.button>
  );
}
