'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useCallStore } from '@/lib/store/callStore';
import { GlassAvatar } from '@/components/ui/GlassAvatar';

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
};

export function CallOverlay() {
  const {
    isInCall,
    callType,
    remoteUser,
    isMuted,
    isCameraOff,
    endCall,
    toggleMute,
    toggleCamera,
  } = useCallStore();

  return (
    <AnimatePresence>
      {isInCall && remoteUser && (
        <motion.div
          className={cn(
            'fixed inset-0 z-[200] flex flex-col items-center justify-between',
            'bg-black/80 [backdrop-filter:blur(40px)] [-webkit-backdrop-filter:blur(40px)]'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={springTransition}
        >
          {/* Remote user info */}
          <div className="flex flex-col items-center pt-20">
            <GlassAvatar
              src={remoteUser.avatarUrl}
              alt={remoteUser.displayName}
              size="xxl"
            />
            <h2 className="mt-4 text-headline text-text-primary">
              {remoteUser.displayName}
            </h2>
            <p className="text-body text-text-secondary mt-1">
              {callType === 'video' ? 'Video Call' : 'Voice Call'}
            </p>
          </div>

          {/* Video placeholders */}
          {callType === 'video' && (
            <div className="flex-1 flex items-center justify-center gap-4 w-full px-4 py-8">
              {/* Remote video */}
              <div className="relative flex-1 max-w-2xl aspect-video rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-body text-text-tertiary">Remote Video</span>
              </div>
              {/* Local video (PiP) */}
              <div className="absolute bottom-32 right-6 w-32 aspect-video rounded-md bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-caption text-text-tertiary">You</span>
              </div>
            </div>
          )}

          {/* Control buttons */}
          <div className="flex items-center gap-4 pb-12">
            {/* Mute toggle */}
            <button
              onClick={toggleMute}
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
                isMuted
                  ? 'bg-white/20 text-red-400'
                  : 'bg-white/10 text-text-primary'
              )}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {isMuted ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 19L5 5m14 0v4a2 2 0 01-2 2H7m0 4v1a2 2 0 002 2h6a2 2 0 002-2v-1M12 19v3m-4 0h8" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                )}
              </svg>
            </button>

            {/* Camera toggle (video only) */}
            {callType === 'video' && (
              <button
                onClick={toggleCamera}
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
                  isCameraOff
                    ? 'bg-white/20 text-red-400'
                    : 'bg-white/10 text-text-primary'
                )}
                aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {isCameraOff ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25zM3 3l18 18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  )}
                </svg>
              </button>
            )}

            {/* End call */}
            <button
              onClick={endCall}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              aria-label="End call"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m-4.242-9.9a9 9 0 0112.728 0" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
