export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-gradient-messages p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 rounded bg-white/10" />
        <div className="glass-surface h-16 rounded-lg" />
        <div className="glass-surface h-16 rounded-lg" />
        <div className="glass-surface h-16 rounded-lg" />
      </div>
    </div>
  );
}
