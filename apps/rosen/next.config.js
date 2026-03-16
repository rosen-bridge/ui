/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  typedRoutes: true,
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
  webpack: function (config, options) {
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
    if (!options.isServer) {
      config.resolve.fallback = {
        'fs': false,
        // Ignore the dependency imported internally by @reown/appkit since we don't use Solana
        '@solana/kit': false,
        // Ignore the dependency warning from @metamask/sdk
        '@react-native-async-storage/async-storage': false,
      };
    }
    config.resolve.alias['@solana/kit'] = false;

    return config;
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

module.exports = nextConfig;
