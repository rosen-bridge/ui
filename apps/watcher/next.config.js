// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  staticPageGenerationTimeout: 600,
};

module.exports = nextConfig;
