import fs from 'node:fs';
import path from 'node:path';

import * as glob from 'glob';

const lines = [];
const declarations = [];

glob
  .sync('**/*.svg', {
    posix: true,
    cwd: path.resolve(import.meta.dirname, 'src'),
  })
  .sort((a, b) => a.localeCompare(b))
  .forEach((file) => {
    const filename = path.basename(file, path.extname(file));

    const componentName = filename.replace(/(^\w|-\w)/g, (match) =>
      match.replace('-', '').toUpperCase(),
    );

    lines.push(`export { default as ${componentName} } from './${file}';`, '');
    declarations.push(`export declare const ${componentName}: SVGIcon;`);
  });

if (process.argv.includes('--declarations')) {
  const types = fs.readFileSync(path.resolve(import.meta.dirname, 'src', 'types.ts'), 'utf8');
  fs.writeFileSync(
    path.resolve(import.meta.dirname, 'dist', 'index.d.ts'),
    `${types}\n${declarations.join('\n')}\n`,
    'utf8',
  );
} else {
  const content = [...lines, "export type { SVGIcon } from './types';", ''].join('\n');
  fs.writeFileSync(path.resolve(import.meta.dirname, 'src', 'index.ts'), content, 'utf8');
}
