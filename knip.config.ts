import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {},
  ignoreBinaries: ['typeorm'],
  ignore: ['**/node_modules/', '**/dist/', '**/.next/'],
  ignoreDependencies: [
    '@mui/material',
    '@next/eslint-plugin-next',
    '@types/moment',
    '@types/react',
    '@vitest/runner',
    'eslint-config-next',
    'pg',
  ],
};

export default config;
