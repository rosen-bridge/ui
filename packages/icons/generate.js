import * as glob from 'glob';
import fs from 'node:fs';
import path from 'node:path';

const content = glob
  .sync('**/*.svg', {
    posix: true,
    cwd: path.resolve(import.meta.dirname, 'src'),
  })
  .sort((a, b) => a.localeCompare(b))
  .map((file) => {
    const componentName = path
      .basename(file, path.extname(file))
      .replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase());

    return [
      `export { ReactComponent as ${componentName} } from './${file}';`,
      `export { default as ${componentName}Raw } from './${file}?raw';`,
      '',
    ];
  })
  .flat()
  .join('\n');

fs.writeFileSync(
  path.resolve(import.meta.dirname, 'src', 'index.ts'),
  content,
  'utf8',
);
