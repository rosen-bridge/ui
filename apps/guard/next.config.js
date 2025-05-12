// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  staticPageGenerationTimeout: 600,
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  },
};

module.exports = nextConfig;
