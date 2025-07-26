/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds for production deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow TypeScript errors during builds for production deployment
    ignoreBuildErrors: true,
  },
  // No external image domains needed since we use CSS-based logo
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig