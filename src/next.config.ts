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
        source: '/api/v1/:path*',
        destination: 'https://caraonback.cognick.qzz.io/api/v1/:path*',
      },
      // This rewrite is for WebSocket connections
      {
        source: '/:path*',
        destination: 'https://caraonback.cognick.qzz.io/:path*',
        has: [
            {
                type: 'header',
                key: 'upgrade',
                value: 'websocket',
            },
        ],
      },
    ]
  },
};

export default nextConfig;
