'use client';

import { ToastContainer } from '@/components/ui/Toast';
import { CallOverlay } from '@/components/feature/CallOverlay';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop: GlassSidebar (left nav) */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0">
        <nav className="flex flex-1 flex-col gap-2 p-4 border-r border-white/25 bg-white/12 [backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)]">
          <div className="text-headline text-primary mb-8 font-bold">Lifeframe</div>
          <a href="/feed" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-body text-text-secondary hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20 hover:text-text-primary transition-colors">
            Feed
          </a>
          <a href="/explore" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-body text-text-secondary hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20 hover:text-text-primary transition-colors">
            Explore
          </a>
          <a href="/reels" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-body text-text-secondary hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20 hover:text-text-primary transition-colors">
            Reels
          </a>
          <a href="/messages" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-body text-text-secondary hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20 hover:text-text-primary transition-colors">
            Messages
          </a>
          <a href="/creator-hub" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-body text-text-secondary hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20 hover:text-text-primary transition-colors">
            Creator Hub
          </a>
          <a href="/profile" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-body text-text-secondary hover:bg-gradient-to-r hover:from-primary/20 hover:to-secondary/20 hover:text-text-primary transition-colors">
            Profile
          </a>
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 lg:ml-60">
        {/* Desktop: GlassNavbar (top) - hidden on mobile */}
        <header className="sticky top-0 z-40 hidden md:flex h-16 items-center justify-between px-6 border-b border-white/25 bg-white/12 [backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)]">
          <div className="text-title text-text-primary">Lifeframe</div>
          <div className="flex items-center gap-4">
            <span className="text-body text-text-secondary">Search</span>
            <div className="h-8 w-8 rounded-full bg-white/20" />
          </div>
        </header>

        {/* Page content */}
        <div className="pb-20 md:pb-0">{children}</div>

        {/* Mobile: Bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden h-16 items-center justify-around px-2 border-t border-white/25 bg-white/12 [backdrop-filter:blur(20px)] [-webkit-backdrop-filter:blur(20px)]">
          <a href="/feed" className="flex flex-col items-center gap-1 text-text-secondary">
            <span className="text-label">Feed</span>
          </a>
          <a href="/explore" className="flex flex-col items-center gap-1 text-text-secondary">
            <span className="text-label">Explore</span>
          </a>
          <a href="/reels" className="flex flex-col items-center gap-1 text-text-secondary">
            <span className="text-label">Reels</span>
          </a>
          <a href="/messages" className="flex flex-col items-center gap-1 text-text-secondary">
            <span className="text-label">Messages</span>
          </a>
          <a href="/creator-hub" className="flex flex-col items-center gap-1 text-text-secondary">
            <span className="text-label">Creator</span>
          </a>
        </nav>
      </main>

      {/* Global overlays */}
      <ToastContainer />
      <CallOverlay />
    </div>
  );
}
