'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';

export interface GlassSheetProps {
  isOpen: boolean;
  onClose: () => void;
  side?: 'bottom' | 'right';
  children: React.ReactNode;
  className?: string;
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
};

export function GlassSheet({
  isOpen,
  onClose,
  side,
  children,
  className,
}: GlassSheetProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const effectiveSide = side || (isMobile ? 'bottom' : 'right');
  const dragControls = useDragControls();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const bottomSheetVariants = {
    hidden: { y: '100%' },
    visible: { y: 0 },
  };

  const rightPanelVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  };

  const variants = effectiveSide === 'bottom' ? bottomSheetVariants : rightPanelVariants;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className={cn(
              'absolute border border-white/25 bg-white/12',
              '[backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)]',
              effectiveSide === 'bottom' &&
                'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-lg',
              effectiveSide === 'right' &&
                'right-0 top-0 bottom-0 w-full max-w-md rounded-l-lg',
              className
            )}
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={springTransition}
            drag={effectiveSide === 'bottom' ? 'y' : false}
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, info) => {
              if (effectiveSide === 'bottom' && info.offset.y > 100) {
                onClose();
              }
            }}
          >
            {/* Drag handle for bottom sheet */}
            {effectiveSide === 'bottom' && (
              <div
                className="flex justify-center py-3"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="h-1 w-10 rounded-full bg-white/40" />
              </div>
            )}

            <div className="overflow-y-auto p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
