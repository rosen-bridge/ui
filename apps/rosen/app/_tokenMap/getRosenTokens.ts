'use server';

import fs from 'fs';
import path from 'path';

import { wrap } from '@/_safeServerAction';

/**
 * get rosen tokens object from tokensMap file or throw error if file is missing
 */
export const getRosenTokens = async () => {
  const tokensMapFilePath = path.resolve(
    process.cwd(),
    'configs/tokensMap.json',
  );

  if (fs.existsSync(tokensMapFilePath)) {
    const { tokens } = JSON.parse(
      fs.readFileSync(tokensMapFilePath, {
        encoding: 'utf-8',
      }),
    );
    return tokens;
  }

  throw new Error(`Tokens map file not found in the path ${tokensMapFilePath}`);
};

export const getRosenTokensWithCache = wrap(getRosenTokens, {
  cache: 60 * 1000,
  traceKey: 'getRosenTokens',
});
