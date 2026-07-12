import fs from 'node:fs';
import path from 'node:path';
import * as url from 'node:url';

import { NETWORKS_KEYS } from '@rosen-ui/constants';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const contracts = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'contracts.json')),
);

fs.rmSync(path.join(__dirname, 'contracts.json'));

const tokensMap = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'tokensMap.json')),
);

fs.rmSync(path.join(__dirname, 'tokensMap.json'));

const content = [
  '/**************************************************',
  ' * THIS FILE IS AUTO-GENERATED. PLEASE DO NOT EDIT IT',
  ' * MANUALLY OR COMMIT IT TO THE REPOSITORY HOSTING SERVICE',
  ' **************************************************/',
  `import { RosenTokens } from '@rosen-bridge/tokens';`,
  `import { NETWORKS } from '@rosen-ui/constants';`,
  '',
  `export const CONTRACT_VERSION = '${contracts.version || ''}';`,
  '',
  `export const FEE_CONFIG_TOKEN_ID = '${contracts.tokens.MinFeeNFT || ''}';`,
  '',
  `export const LOCK_ADDRESSES: { [key in keyof typeof NETWORKS]: string } = {`,
  ...NETWORKS_KEYS.map(
    (network) =>
      `  '${network}': '${contracts[network]?.addresses?.lock || ''}',`,
  ),
  `};`,
  '',
  `export const TOKENS: RosenTokens = ${JSON.stringify(tokensMap.tokens, null, 2)};`,
];

fs.writeFileSync(path.join(__dirname, './index.ts'), content.join('\n'));
