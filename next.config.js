/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar modo standalone para Docker
  output: 'standalone',
  
  images: {
    domains: ['localhost', 'uploadthing.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  
  // Temporarily disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig