'use server';

/**
 * Server action for generating signed Cloudinary upload signatures.
 * The Cloudinary API secret is used server-side only.
 */
export async function generateUploadSignature(
  params: Record<string, string>
): Promise<{ signature: string; timestamp: number }> {
  const timestamp = Math.round(Date.now() / 1000);

  // TODO: Implement with Cloudinary API secret (server-side only)
  // const crypto = await import('crypto');
  // const apiSecret = process.env.CLOUDINARY_API_SECRET;
  // const paramsToSign = { ...params, timestamp };
  // const sortedParams = Object.entries(paramsToSign).sort().map(([k, v]) => `${k}=${v}`).join('&');
  // const signature = crypto.createHash('sha256').update(sortedParams + apiSecret).digest('hex');

  return {
    signature: '', // Placeholder until API secret is configured
    timestamp,
  };
}
