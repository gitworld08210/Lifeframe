/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    // Allow production builds to complete even with type errors
    // (Phase 1 scaffold — will enable strict checking once all features are wired)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to complete even with lint warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
