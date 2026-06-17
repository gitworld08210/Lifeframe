import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  return {
    title: `@${params.username} - Lifeframe`,
    description: `View ${params.username}'s profile on Lifeframe`,
    openGraph: {
      title: `@${params.username} - Lifeframe`,
      description: `View ${params.username}'s profile on Lifeframe`,
      type: 'profile',
    },
  };
}

export default function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-profile p-6">
      <h1 className="text-display-lg text-text-primary mb-4">
        @{params.username}
      </h1>
      <p className="text-body text-text-secondary">Public profile view</p>
    </div>
  );
}
