import * as glob from 'glob';
import fs from 'node:fs';
import path from 'node:path';

glob
  .sync('tokens/*.png', {
    absolute: true,
    cwd: path.resolve(import.meta.dirname, 'src'),
  })
  .forEach((file) => {
    const base64 = fs.readFileSync(file).toString('base64');

    const content = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 128 128"
      >
        <image
          href="data:image/png;base64,${base64}"
          width="128"
          height="128"
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>
    `;

    fs.writeFileSync(file.replace('.png', '.svg'), content, 'utf8');
  });

let content = '';

content += "import { lazy } from 'react';\n\n";

content += glob
  .sync('**/*.svg', {
    posix: true,
    cwd: path.resolve(import.meta.dirname, 'src'),
  })
  .sort((a, b) => a.localeCompare(b))
  .map((file) => {
    const name = path.basename(file, path.extname(file));

    if (file.startsWith('tokens/')) {
      return `export const Token_${name} = lazy(() => import('./${file}').then((result) => ({ default: result.ReactComponent })));`;
    }

    const componentName = name.replace(/(^\w|-\w)/g, (match) =>
      match.replace('-', '').toUpperCase(),
    );

    return [
      `export { ReactComponent as ${componentName} } from './${file}';`,
      `export { default as ${componentName}Raw } from './${file}?raw';`,
      '',
    ];
  })
  .flat()
  .join('\n');

content += '\n';

fs.writeFileSync(
  path.resolve(import.meta.dirname, 'src', 'index.ts'),
  content,
  'utf8',
);
