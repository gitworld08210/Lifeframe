'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useUIStore, type Toast as ToastType } from '@/lib/store/uiStore';

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
};

const typeStyles: Record<ToastType['type'], { border: string; icon: string }> = {
  success: { border: 'border-l-green-500', icon: 'text-green-500' },
  error: { border: 'border-l-red-500', icon: 'text-red-500' },
  info: { border: 'border-l-blue-500', icon: 'text-blue-500' },
  warning: { border: 'border-l-yellow-500', icon: 'text-yellow-500' },
};

interface ToastItemProps {
  toast: ToastType;
}

export function Toast({ toast }: ToastItemProps) {
  const removeToast = useUIStore((state) => state.removeToast);

  useEffect(() => {
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  const styles = typeStyles[toast.type];

  return (
    <motion.div
      layout
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={springTransition}
      className={cn(
        'relative flex items-center gap-3 rounded-md border border-white/25 border-l-4 bg-white/12 px-4 py-3',
        '[backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)]',
        styles.border
      )}
    >
      {/* Icon */}
      <span className={cn('shrink-0', styles.icon)}>
        {toast.type === 'success' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {toast.type === 'error' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {toast.type === 'info' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {toast.type === 'warning' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      </span>

      {/* Message */}
      <p className="flex-1 text-body text-text-primary">{toast.message}</p>

      {/* Close button */}
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-text-tertiary hover:text-text-primary transition-colors"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
