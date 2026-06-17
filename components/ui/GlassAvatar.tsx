'use client';

import { cn } from '@/lib/utils/cn';

export interface GlassAvatarProps {
  src?: string;
  alt: string;
  size: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
  online?: boolean;
  verified?: boolean;
  premium?: boolean;
  className?: string;
}

const sizeMap: Record<GlassAvatarProps['size'], { container: string; dot: string; badge: string }> = {
  xs: { container: 'h-6 w-6', dot: 'h-2 w-2 border', badge: 'h-3 w-3' },
  s: { container: 'h-8 w-8', dot: 'h-2.5 w-2.5 border', badge: 'h-3.5 w-3.5' },
  m: { container: 'h-10 w-10', dot: 'h-3 w-3 border-2', badge: 'h-4 w-4' },
  l: { container: 'h-14 w-14', dot: 'h-3.5 w-3.5 border-2', badge: 'h-5 w-5' },
  xl: { container: 'h-20 w-20', dot: 'h-4 w-4 border-2', badge: 'h-6 w-6' },
  xxl: { container: 'h-[120px] w-[120px]', dot: 'h-5 w-5 border-2', badge: 'h-7 w-7' },
};

export function GlassAvatar({
  src,
  alt,
  size,
  online = false,
  verified = false,
  premium = false,
  className,
}: GlassAvatarProps) {
  const sizeConfig = sizeMap[size];

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {/* Premium gradient ring */}
      {premium && (
        <div
          className={cn(
            'absolute -inset-[3px] rounded-full',
            'bg-gradient-to-r from-gold via-yellow-300 to-gold',
            'animate-shimmer'
          )}
        />
      )}

      {/* Avatar image or placeholder */}
      <div
        className={cn(
          'relative overflow-hidden rounded-full',
          sizeConfig.container,
          premium && 'ring-2 ring-transparent'
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          /* Shimmer placeholder */
          <div
            className={cn(
              'relative h-full w-full rounded-full bg-white/10 overflow-hidden',
              'before:absolute before:inset-0',
              'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
              'before:animate-shimmer'
            )}
          />
        )}
      </div>

      {/* Online dot */}
      {online && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-green-500 border-black',
            sizeConfig.dot
          )}
        />
      )}

      {/* Verified badge */}
      {verified && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-blue-500',
            sizeConfig.badge
          )}
        >
          <svg className="h-2/3 w-2/3" fill="white" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </span>
      )}
    </div>
  );
}
