import { NETWORKS_KEYS } from '@rosen-ui/constants';
import fs from 'node:fs';
import path from 'node:path';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const contracts = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'contracts.json')),
);

fs.rmSync(path.join(__dirname, 'contracts.json'));

const tokensMap = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'tokensMap.json')),
);

const content = [
  '/**************************************************',
  ' * THIS FILE IS AUTO-GENERATED. PLEASE DO NOT EDIT IT',
  ' * MANUALLY OR COMMIT IT TO THE REPOSITORY HOSTING SERVICE',
  ' **************************************************/',
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
  `} as any;`,
  '',
  `export const TOKENS_MAPPER: {`,
  `  [key: string]: { name: string; ergoSideTokenId: string; }`,
  `} = {`,
  ...tokensMap.tokens
    .map((tokens) => {
      return Object.entries(tokens).map(([key, token]) => {
        return `  '${token.tokenId}': { name: '${token.name}', ergoSideTokenId: '${tokens.ergo.tokenId}' },`;
      });
    })
    .flat(1),
  `} as any;`,
  '',
];

fs.writeFileSync(path.join(__dirname, './index.ts'), content.join('\n'));
