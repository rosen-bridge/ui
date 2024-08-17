'use server';

import fs from 'fs';
import path from 'path';

let tokens: any;

export const getTokenMapObject = () => {
  if (tokens) return tokens;
  tokens = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'configs', 'tokensMap.json'),
      'utf-8',
    ),
  );
  return tokens;
};
