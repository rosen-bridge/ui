/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'ergo-lib-wasm-nodejs',
      '@emurgo/cardano-serialization-lib-nodejs',
    ],
    instrumentationHook: true,
  },
  transpilePackages: [
    '@rosen-bridge/winston-logger',
    '@rosen-bridge/extended-typeorm',
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
