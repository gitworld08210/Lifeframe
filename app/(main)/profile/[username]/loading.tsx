export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-profile p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-48 rounded-lg bg-white/10" />
        <div className="h-8 w-32 rounded bg-white/10" />
        <div className="h-4 w-48 rounded bg-white/5" />
      </div>
    </div>
  );
}
