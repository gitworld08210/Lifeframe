export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-feed">
      <header className="glass-surface sticky top-0 z-40 flex h-16 items-center justify-between px-6">
        <a href="/" className="text-headline text-primary">
          Lifeframe
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="text-body text-text-secondary hover:text-text-primary transition-colors"
          >
            Login
          </a>
          <a
            href="/signup"
            className="rounded-md bg-primary px-4 py-2 text-label text-white transition-opacity hover:opacity-90"
          >
            Sign Up
          </a>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
