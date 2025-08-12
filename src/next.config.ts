import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/agent/:path*',
        destination: 'https://ariac.sariac.qzz.io/agent/:path*',
      },
      {
        source: '/api/v1/:path*',
        destination: 'https://app.sariac.qzz.io/api/v1/:path*',
      },
    ]
  },
};

export default nextConfig;
