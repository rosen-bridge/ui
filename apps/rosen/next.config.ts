import type { NextConfig } from 'next';

import type { SentryBuildOptions } from '@sentry/nextjs';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: [
    'ergo-lib-wasm-nodejs',
    '@emurgo/cardano-serialization-lib-nodejs',
    '@reown/appkit-adapter-ethers',
  ],
  async headers() {
    return [
      {
        source: '/(.*?)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

const sentryOptions: SentryBuildOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  tunnelRoute: '/monitoring',
  debug: false,
  webpack: {
    treeshake: {
      removeDebugLogging: false,
    },
  },
};

export default withSentryConfig(nextConfig, sentryOptions);
