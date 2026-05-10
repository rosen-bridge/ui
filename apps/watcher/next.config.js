// @ts-check
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  images: {
    unoptimized: true,
  },
  output: 'export',
  webpack: function (config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
    };
    // Required for `output: 'export'` — ensures the .wasm file lands in
    // the static assets output (so Next's static export copies it into out/).
    config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  staticPageGenerationTimeout: 600,
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

module.exports = nextConfig;
