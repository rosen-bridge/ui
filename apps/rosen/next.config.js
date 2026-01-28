const path = require('path');
/** @type {import('next').NextConfig} */

const nextConfig = {
  outputFileTracingIncludes: {
    '/': ['./configs/*'],
  },
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

  webpack: (config, { isServer }) => {
    /**
     * This configuration should be applied as recommended in:
     * https://docs.reown.com/appkit/next/core/installation#extra-configuration
     */
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    config.experiments = {
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };

    // Fix fallback overrides
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
};

module.exports = nextConfig;
