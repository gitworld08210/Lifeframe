'use client';

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
}

export interface GlassDropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  className?: string;
  align?: 'left' | 'right';
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
};

export function GlassDropdown({
  trigger,
  items,
  className,
  align = 'left',
}: GlassDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
          setActiveIndex(0);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0) {
            items[activeIndex].onClick();
            close();
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    },
    [isOpen, items, activeIndex, close]
  );

  useEffect(() => {
    if (activeIndex >= 0 && itemsRef.current[activeIndex]) {
      itemsRef.current[activeIndex]?.focus();
    }
  }, [activeIndex]);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)} onKeyDown={handleKeyDown}>
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              'absolute z-50 mt-2 min-w-[180px] rounded-md border border-white/25 bg-white/12 py-1',
              '[backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)]',
              align === 'right' ? 'right-0' : 'left-0'
            )}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={springTransition}
            role="menu"
          >
            {items.map((item, index) => (
              <button
                key={item.label}
                ref={(el) => { itemsRef.current[index] = el; }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-body transition-colors',
                  index === activeIndex && 'bg-white/10',
                  item.danger
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-text-secondary hover:bg-white/10 hover:text-text-primary'
                )}
                onClick={() => {
                  item.onClick();
                  close();
                }}
                role="menuitem"
                tabIndex={-1}
              >
                {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
