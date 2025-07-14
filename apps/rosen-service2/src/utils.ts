import { TokenMap } from '@rosen-bridge/tokens';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const getTokenMap = async (): Promise<TokenMap> => {
  const tokensMapFilePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../config/tokensMap.json',
  );

  if (fs.existsSync(tokensMapFilePath)) {
    const { tokens } = JSON.parse(
      fs.readFileSync(tokensMapFilePath, {
        encoding: 'utf-8',
      }),
    );

    const tokenMap = new TokenMap();

    await tokenMap.updateConfigByJson(tokens);

    return tokenMap;
  }

  throw new Error(`Tokens map file not found in the path ${tokensMapFilePath}`);
};
