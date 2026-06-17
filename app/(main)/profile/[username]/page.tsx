export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-profile p-6">
      <h1 className="text-display-lg text-text-primary mb-4">
        @{params.username}
      </h1>
      <p className="text-body text-text-secondary">User profile page</p>
    </div>
  );
}
