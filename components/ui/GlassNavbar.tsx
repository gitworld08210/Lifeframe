'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useScrollPosition } from '@/lib/hooks/useScrollPosition';

export interface GlassNavbarProps {
  className?: string;
}

export function GlassNavbar({ className }: GlassNavbarProps) {
  const scrollPosition = useScrollPosition();
  const isScrolled = scrollPosition > 0;

  return (
    <motion.header
      className={cn(
        'sticky top-0 z-50 hidden md:flex h-16 items-center justify-between px-6 transition-colors',
        isScrolled
          ? 'border-b border-white/25 bg-white/12 [backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)]'
          : 'bg-transparent',
        className
      )}
      animate={{
        backgroundColor: isScrolled ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-2">
        <span className="text-headline text-primary font-bold">Lifeframe</span>
      </div>

      {/* Center nav items (desktop) */}
      <nav className="hidden lg:flex items-center gap-6">
        <a href="/feed" className="text-body text-text-secondary hover:text-text-primary transition-colors">
          Feed
        </a>
        <a href="/explore" className="text-body text-text-secondary hover:text-text-primary transition-colors">
          Explore
        </a>
        <a href="/reels" className="text-body text-text-secondary hover:text-text-primary transition-colors">
          Reels
        </a>
      </nav>

      {/* Right side: user avatar + actions */}
      <div className="flex items-center gap-4">
        <button className="text-body text-text-secondary hover:text-text-primary transition-colors">
          Search
        </button>
        <div className="h-8 w-8 rounded-full bg-white/20" />
      </div>
    </motion.header>
  );
}
