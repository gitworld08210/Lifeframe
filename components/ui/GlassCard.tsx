'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface GlassCardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
};

export function GlassCard({ className, children, hover = false }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass-surface relative rounded-lg p-4',
        className
      )}
      whileHover={hover ? { scale: 1.02 } : undefined}
      transition={springTransition}
    >
      {children}
    </motion.div>
  );
}
