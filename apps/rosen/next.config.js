/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'ergo-lib-wasm-nodejs',
      '@emurgo/cardano-serialization-lib-nodejs',
      'typeorm',
    ],
    instrumentationHook: true,
  },
  transpilePackages: [
    '@rosen-bridge/abstract-logger',
    '@rosen-bridge/extended-typeorm',
    '@rosen-bridge/logger-interface',
    '@rosen-bridge/observation-extractor',
    '@rosen-bridge/rosen-extractor',
    '@rosen-bridge/scanner',
    '@rosen-bridge/winston-logger',
    '@rosen-clients/ergo-explorer',
    '@rosen-clients/ergo-node',
  ],
  webpack: function (config, options) {
    config.experiments = {
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

module.exports = nextConfig;
