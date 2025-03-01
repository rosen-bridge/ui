import fs from 'fs';
import * as glob from 'glob';
import path from 'path';

const content = glob
  .sync('**/*.svg')
  .sort((a, b) => a.localeCompare(b))
  .map((file) => {
    const importPath = file.replace(/^src\//, './');

    const componentName = path
      .basename(file, path.extname(file))
      .replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase());

    return [
      `export { ReactComponent as ${componentName} } from '${importPath}';`,
      `export { default as ${componentName}Raw } from '${importPath}?raw';`,
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
