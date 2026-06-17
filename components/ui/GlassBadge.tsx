'use client';

import { cn } from '@/lib/utils/cn';

export interface GlassBadgeProps {
  variant: 'verified' | 'founder' | 'premium-silver' | 'premium-gold' | 'ai-creator' | 'business';
  className?: string;
}

function BadgeIcon({ variant }: { variant: GlassBadgeProps['variant'] }) {
  switch (variant) {
    case 'verified':
      return (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
      );
    case 'founder':
      return (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case 'premium-silver':
    case 'premium-gold':
      return (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
        </svg>
      );
    case 'ai-creator':
      return (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      );
    case 'business':
      return (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z" />
        </svg>
      );
    default:
      return null;
  }
}

const variantStyles: Record<GlassBadgeProps['variant'], string> = {
  verified: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  founder: 'bg-gold/20 text-gold border-gold/30',
  'premium-silver': 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 text-gray-300 border-gray-400/30',
  'premium-gold': 'bg-gradient-to-r from-gold/20 to-yellow-500/20 text-gold border-gold/30',
  'ai-creator': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  business: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const variantLabels: Record<GlassBadgeProps['variant'], string> = {
  verified: 'Verified',
  founder: 'Founder',
  'premium-silver': 'Premium',
  'premium-gold': 'Premium',
  'ai-creator': 'AI Creator',
  business: 'Business',
};

export function GlassBadge({ variant, className }: GlassBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-caption font-medium',
        variantStyles[variant],
        className
      )}
    >
      <BadgeIcon variant={variant} />
      <span>{variantLabels[variant]}</span>
    </span>
  );
}
