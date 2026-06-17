export default function ReelsLoading() {
  return (
    <div className="min-h-screen bg-gradient-reels p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-24 rounded bg-white/10" />
        <div className="grid grid-cols-3 gap-2">
          <div className="aspect-[9/16] rounded-lg bg-white/10" />
          <div className="aspect-[9/16] rounded-lg bg-white/10" />
          <div className="aspect-[9/16] rounded-lg bg-white/10" />
        </div>
      </div>
    </div>
  );
}
