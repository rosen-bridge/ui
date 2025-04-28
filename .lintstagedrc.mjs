import fs from 'fs';
import path from 'path';

const perPackage = (resolver) => (files) => {
  return Array.from(
    files.reduce((packages, file) => {
      let directory = path.dirname(file);
      while (directory && directory !== process.cwd()) {
        if (fs.existsSync(path.join(directory, 'package.json'))) {
          packages.add(resolver(directory, file));
          break;
        }
        const parent = path.dirname(directory);
        if (parent === directory) break;
        directory = parent;
      }
      return packages;
    }, new Set()),
  );
};

export default {
  '*': 'prettier --ignore-unknown --write',
  '**/{networks,packages,wallets}/**/*.{js,jsx,ts,tsx}': 'eslint --fix',
  '**/apps/{guard,rosen,watcher}/**/*.{js,jsx,ts,tsx}': perPackage(
    (directory, file) => {
      return `next lint ${directory} --fix --file ${path.relative(directory, file)}`;
    },
  ),
  '**/*.{ts,tsx}': perPackage((directory) => {
    return `npm run type-check --workspace ${path.relative(process.cwd(), directory)}`;
  }),
  '**/*.{js,jsx,ts,tsx}': perPackage((directory) => {
    return `npx depcheck --ignores="@mui/material, @types/react, @types/node, @types/react-dom, @vitest/runner, eslint-config-prettier, tsx, vitest" --ignore-patterns="vite.config.ts.timestamp-*" ${path.relative(process.cwd(), directory)}`;
  }),
  '*.{js,jsx,ts,tsx}': 'npm run test:related',
};
