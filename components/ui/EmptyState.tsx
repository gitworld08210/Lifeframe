'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { GlassButton } from './GlassButton';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        <div className="mb-4 text-text-tertiary">{icon}</div>
      )}
      <h3 className="text-headline text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-body text-text-secondary max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <GlassButton variant="primary" onClick={action.onClick}>
          {action.label}
        </GlassButton>
      )}
    </div>
  );
}
