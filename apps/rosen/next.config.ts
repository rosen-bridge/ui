import fs from 'node:fs';
import path from 'node:path';

import type { NextConfig } from 'next';

import { type SentryBuildOptions, withSentryConfig } from '@sentry/nextjs/config';

import { env } from './src/env';

if (!process.env.TOKEN_ICONS_COPIED) {
  const source = path.join(
    path.dirname(require.resolve('@rosen-bridge/token-icons/package.json')),
    'dist',
  );

  const target = path.join(__dirname, 'public/icons/tokens');

  fs.rmSync(target, { recursive: true, force: true });

  fs.cpSync(source, target, { recursive: true });

  process.env.TOKEN_ICONS_COPIED = 'true';
}

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
