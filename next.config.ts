import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow all hosts in development (for tunnel testing)
  experimental: {
    allowedDevOrigins: [
      'localhost',
      'specially-qui-network-achieving.trycloudflare.com',
      /^.*\.trycloudflare\.com$/,
      /^.*\.loca\.lt$/,
      /^.*\.pinggy\.io$/
    ] as any,
  },
  // the stable property is 'allowedDevOrigins', let's also try at root
  allowedDevOrigins: [
    'localhost',
    'specially-qui-network-achieving.trycloudflare.com',
  ],
};

export default nextConfig;
