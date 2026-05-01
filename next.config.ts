import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow all hosts in development (for tunnel testing)
  serverActions: {
    allowedOrigins: [
      'localhost',
      'specially-qui-network-achieving.trycloudflare.com',
      '*.trycloudflare.com',
      '*.loca.lt',
      '*.pinggy.io'
    ],
  },
};

export default nextConfig;
