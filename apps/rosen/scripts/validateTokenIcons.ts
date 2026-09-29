import * as icons from '@rosen-bridge/token-icons';

import { env } from '@/env';

import { TOKENS } from '../configs';

if (env.IGNORE_TOKEN_ICONS.includes('*')) {
  console.log('✓ Token icon validation skipped.');
  process.exit(0);
}

const iconIds = new Set(Object.keys(icons));

const missingTokens = TOKENS.filter(
  (token) =>
    !env.IGNORE_TOKEN_ICONS.includes(token.ergo.tokenId) &&
    !iconIds.has(`Token_${token.ergo.tokenId}`),
).map((token) => token.ergo);

if (missingTokens.length === 0) {
  console.log(`✓ All ${TOKENS.length} token icons exist.`);
  process.exit(0);
}

console.error('❌ Missing token icons:');

console.table(missingTokens, ['name', 'tokenId']);

process.exit(1);
