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
        destination: 'http://caraonback.cognick.qzz.io/api/v1/:path*',
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
        config.devServer = {
            ...config.devServer,
            proxy: {
                ...config.devServer?.proxy,
                '/': {
                    target: 'http://caraonback.cognick.qzz.io',
                    ws: true,
                    changeOrigin: true,
                },
            },
        };
    }
    return config;
  },
};

export default nextConfig;
