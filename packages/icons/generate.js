import * as glob from 'glob';
import fs from 'node:fs';
import path from 'node:path';

const lines = [];

glob
  .sync(['icons/*.svg', 'networks/*.svg'], {
    posix: true,
    cwd: path.resolve(import.meta.dirname, 'src'),
  })
  .sort((a, b) => a.localeCompare(b))
  .forEach((file) => {
    const filename = path.basename(file, path.extname(file));

    const componentName = filename.replace(/(^\w|-\w)/g, (match) =>
      match.replace('-', '').toUpperCase(),
    );

    lines.push(
      `export { default as ${componentName} } from './${file}?react';`,
      `export { default as ${componentName}Raw } from './${file}?raw';`,
      '',
    );
  });

lines.push('export const TOKENS = {');

glob
  .sync('tokens/*.*', {
    posix: true,
    cwd: path.resolve(import.meta.dirname, 'src'),
  })
  .forEach((file) => {
    const filename = path.basename(file, path.extname(file));

    lines.push(
      `  '${filename}': new URL(/* @vite-ignore */'${file}', import.meta.url).href,`,
    );
  });

lines.push('} as const');

const content = lines.join('\n');

fs.writeFileSync(
  path.resolve(import.meta.dirname, 'src', 'index.ts'),
  content,
  'utf8',
);
