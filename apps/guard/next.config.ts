import type { NextConfig } from 'next';

import { env } from './src/env';

const nextConfig: NextConfig = {
  typedRoutes: true,
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  staticPageGenerationTimeout: 600,
  env: {
    API_BASE_URL: env.API_BASE_URL,
  },
};

export default nextConfig;
