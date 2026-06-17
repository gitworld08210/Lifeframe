'use client';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-feed">
      <div className="glass-surface rounded-lg p-8 text-center">
        <h2 className="text-headline text-text-primary mb-4">
          Something went wrong
        </h2>
        <p className="text-body text-text-secondary mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-primary px-6 py-2 text-label text-white transition-opacity hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
