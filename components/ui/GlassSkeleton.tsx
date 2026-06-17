'use client';

import { cn } from '@/lib/utils/cn';

export interface GlassSkeletonProps {
  variant: 'text' | 'circle' | 'card' | 'avatar';
  width?: string;
  height?: string;
  className?: string;
}

const variantStyles: Record<GlassSkeletonProps['variant'], string> = {
  text: 'h-4 w-full rounded',
  circle: 'h-10 w-10 rounded-full',
  card: 'h-48 w-full rounded-lg',
  avatar: 'h-10 w-10 rounded-full',
};

export function GlassSkeleton({ variant, width, height, className }: GlassSkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white/10',
        variantStyles[variant],
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:animate-shimmer',
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
