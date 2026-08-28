import fs from 'node:fs';
import path from 'node:path';

import * as glob from 'glob';

const lines = [];

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
  });

const content = lines.join('\n');

fs.writeFileSync(path.resolve(import.meta.dirname, 'src', 'index.ts'), content, 'utf8');
