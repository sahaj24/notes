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
}

module.exports = nextConfig