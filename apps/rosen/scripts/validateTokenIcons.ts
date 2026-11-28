import { env } from '@/env';

import { TOKENS } from '../configs';

if (env.IGNORE_TOKEN_ICONS.includes('*')) {
  console.log('✓ Token icon validation skipped.');
  process.exit(0);
}

const missingTokens = TOKENS.filter((token) => {
  if (env.IGNORE_TOKEN_ICONS.includes(token.ergo.tokenId)) return false;

  try {
    require.resolve(`@rosen-bridge/token-icons/${token.ergo.tokenId}.svg`);
    return false;
  } catch {
    return true;
  }
}).map((token) => token.ergo);

if (missingTokens.length === 0) {
  console.log(`✓ All ${TOKENS.length} token icons exist.`);
  process.exit(0);
}

console.error('❌ Missing token icons:');

console.table(missingTokens, ['name', 'tokenId']);

process.exit(1);
