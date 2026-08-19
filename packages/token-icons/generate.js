import fs from 'node:fs';
import path from 'node:path';

import * as glob from 'glob';

const lines = [];

glob
  .sync('*.{png,svg}', {
    posix: true,
    cwd: path.resolve(import.meta.dirname, 'src'),
  })
  .forEach((file) => {
    const filename = path.basename(file, path.extname(file));

    lines.push(`export const Token_${filename} = new URL('${file}', import.meta.url).href;`);
  });

const content = lines.join('\n');

fs.writeFileSync(path.resolve(import.meta.dirname, 'src', 'index.ts'), content, 'utf8');
