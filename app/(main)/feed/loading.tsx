export default function FeedLoading() {
  return (
    <div className="min-h-screen bg-gradient-feed p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-24 rounded bg-white/10" />
        <div className="glass-surface h-64 rounded-lg" />
        <div className="glass-surface h-64 rounded-lg" />
      </div>
    </div>
  );
}
