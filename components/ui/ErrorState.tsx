'use client';

import { cn } from '@/lib/utils/cn';
import { GlassButton } from './GlassButton';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {/* Error icon */}
      <div className="mb-4 text-red-400">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h3 className="text-headline text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-body text-text-secondary max-w-sm mb-6">{description}</p>
      )}
      {onRetry && (
        <GlassButton variant="primary" onClick={onRetry}>
          Try Again
        </GlassButton>
      )}
    </div>
  );
}
