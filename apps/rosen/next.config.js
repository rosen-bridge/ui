const path = require('path');
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  serverExternalPackages: [
    'ergo-lib-wasm-nodejs',
    '@emurgo/cardano-serialization-lib-nodejs',
    'typeorm',
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
  webpack: function (config, options) {
    /**
     * This configuration should be applied as recommended in:
     * https://docs.reown.com/appkit/next/core/installation#extra-configuration
     */
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      '@sap/hana-client/extension/Stream': false,
      '@solana/kit': false,
      'mysql': false,
      'react-native-sqlite-storage': false,
    };

    if (!options.isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

/** @type {import('@sentry/nextjs').SentryBuildOptions} */
const sentryOptions = {
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

module.exports = withSentryConfig(nextConfig, sentryOptions);
