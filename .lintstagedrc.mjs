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

const getDepcheckCommand = (directory) => {
  const packages = [
    '@eslint/js',
    '@mui/material',
    '@rosen-bridge/changeset-formatter',
    '@trivago/prettier-plugin-sort-imports',
    '@types/node',
    '@types/react',
    '@types/react-dom',
    '@vitest/runner',
    '@vitest/coverage-istanbul',
    'eslint-config-prettier',
    'lint-staged',
    'pg',
    'prettier',
    'tsx',
    'vitest',
  ];

  const paths = ['vite.config.ts.timestamp-*'];

  return `npx depcheck --ignores="${packages.join(', ')}" --ignore-patterns="${paths.join(', ')}" ${path.relative(process.cwd(), directory)}`;
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
  '**/*.{js,jsx,ts,tsx,mjs}': perPackage(getDepcheckCommand),
  '**/package.json': perPackage(getDepcheckCommand),
  '*.{js,jsx,ts,tsx}': 'npm run test:related',
};
