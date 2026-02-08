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
    '@emotion/react',
    '@emotion/styled',
    '@mui/material',
    '@next/eslint-plugin-next',
    '@rosen-bridge/abstract-logger',
    '@rosen-bridge/abstract-scanner',
    '@rosen-bridge/address-codec',
    '@rosen-bridge/bitcoin-observation-extractor',
    '@rosen-bridge/bitcoin-scanner',
    '@rosen-bridge/cardano-scanner',
    '@rosen-bridge/ergo-scanner',
    '@rosen-bridge/evm-observation-extractor',
    '@rosen-bridge/evm-scanner',
    '@rosen-bridge/extended-typeorm',
    '@rosen-bridge/handshake-rpc-observation-extractor',
    '@rosen-bridge/handshake-rpc-scanner',
    '@rosen-bridge/health-check',
    '@rosen-bridge/json-bigint',
    '@rosen-bridge/log-level-check',
    '@rosen-bridge/minimum-fee',
    '@rosen-bridge/scanner-interfaces',
    '@rosen-bridge/scanner-sync-check',
    '@rosen-bridge/service-manager',
    '@rosen-bridge/tokens',
    '@rosen-bridge/watcher-data-extractor',
    '@tauri-apps/cli',
    '@types/react',
    '@types/react-dom',
    '@vitest/runner',
    'eslint',
    'eslint-config-next',
    'husky',
    'lint-staged',
    'pg',
    'prettier',
    'react-dom',
  ],
};

export default config;
