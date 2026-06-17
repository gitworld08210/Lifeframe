export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

export const CLOUDINARY_API_KEY =
  process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';

/**
 * Server action placeholder for generating signed upload signatures.
 * The actual implementation will use the Cloudinary API secret server-side.
 */
export async function generateUploadSignature(
  params: Record<string, string>
): Promise<{ signature: string; timestamp: number }> {
  'use server';

  // TODO: Implement with Cloudinary API secret (server-side only)
  // This will be called from the client to get a signed upload URL
  const timestamp = Math.round(Date.now() / 1000);

  return {
    signature: '', // Will be computed server-side using API secret
    timestamp,
  };
}
