export default function CreatorHubLoading() {
  return (
    <div className="min-h-screen bg-gradient-creator-hub p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-36 rounded bg-white/10" />
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-surface h-32 rounded-lg" />
          <div className="glass-surface h-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
