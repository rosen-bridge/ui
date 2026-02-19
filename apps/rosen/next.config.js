/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  outputFileTracingIncludes: {
    /**
     * Transfer the 'configs' directory to the production build to ensure
     * the 'tokensMap.json' file is accessible in the production environment.
     */
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
  webpack: function (config) {
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
      'fs': false,

      // Ignore the dependency imported internally by @reown/appkit since we don't use Solana
      '@solana/kit': false,

      // Ignore the dependency warning from @metamask/sdk
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

module.exports = nextConfig;
