import type { NextConfig } from 'next';

import type { SentryBuildOptions } from '@sentry/nextjs';
import { withSentryConfig } from '@sentry/nextjs';

import { env } from './src/env';

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: [
    'ergo-lib-wasm-nodejs',
    '@emurgo/cardano-serialization-lib-nodejs',
    '@coinbase/cdp-sdk',
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
  org: env.SENTRY_ORG,
  project: env.SENTRY_PROJECT,
  authToken: env.SENTRY_AUTH_TOKEN,
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
