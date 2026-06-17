export default function MainLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="glass-surface rounded-lg p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </div>
  );
}
