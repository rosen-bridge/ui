import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
  output: 'export',
  staticPageGenerationTimeout: 600,
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  },
};

export default nextConfig;
