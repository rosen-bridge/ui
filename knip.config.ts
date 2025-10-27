import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'],
    },
    'packages/*': {
      entry: ['{lib,src,tests}/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'],
    },
    'apps/*': {
      entry: ['{app,lib,src,tests}/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'],
    },
    'networks/*': {
      entry: ['{lib,src,tests}/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'],
    },
    'services/*': {
      entry: ['{lib,src,tests}/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'],
    },
    'wallets/*': {
      entry: ['{lib,src,tests}/**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}'],
    },
  },
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
