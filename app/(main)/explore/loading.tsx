export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-gradient-explore p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-28 rounded bg-white/10" />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          <div className="aspect-square rounded-lg bg-white/10" />
          <div className="aspect-square rounded-lg bg-white/10" />
          <div className="aspect-square rounded-lg bg-white/10" />
          <div className="aspect-square rounded-lg bg-white/10" />
        </div>
      </div>
    </div>
  );
}
