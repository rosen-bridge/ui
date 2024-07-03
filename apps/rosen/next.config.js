/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'ergo-lib-wasm-nodejs',
      '@emurgo/cardano-serialization-lib-nodejs',
      'typeorm',
    ],
  },
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
      ...(process.env.ALLOWED_ORIGINS
        ? [
            {
              source: '/api/:path*',
              headers: [
                {
                  key: 'Access-Control-Allow-Origin',
                  value: process.env.ALLOWED_ORIGINS.slice(','),
                },
                {
                  key: 'Access-Control-Allow-Methods',
                  value: 'GET',
                },
                {
                  key: 'Access-Control-Allow-Headers',
                  value: 'Content-Type',
                },
              ],
            },
          ]
        : []),
    ];
  },
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
