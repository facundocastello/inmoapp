import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // size limit for images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: `${process.env.STORAGE_REGION}.${process.env.STORAGE_ENDPOINT}`,
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
