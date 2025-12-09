import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const perPackage = (resolver) => (files) => {
  return Array.from(
    files.reduce((packages, file) => {
      let directory = path.dirname(path.resolve(file));
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

const getKnipCommand = (dir) => {
  const posixRelative = path.posix.relative(process.cwd(), dir);
  return `knip --dependencies --workspace ${posixRelative}`;
};

const runKnipConditional = (files) => {
  const rootChanged = files.some((f) => {
    const relative = path.relative(process.cwd(), path.resolve(f));
    return !relative.includes(path.sep);
  });
  if (rootChanged) {
    return ['knip --dependencies'];
  } else {
    return perPackage(getKnipCommand)(files);
  }
};

const configs = {
  '*': ['prettier --ignore-unknown --write', runKnipConditional],
  '**/{networks,packages,wallets,apps/{guard,rosen,rosen-service2,watcher}}/**/*.{js,jsx,ts,tsx}':
    'eslint --fix',
  '**/*.{ts,tsx}': perPackage((directory) => {
    return `npm run type-check --workspace ${path.relative(process.cwd(), directory)}`;
  }),
  '*.{js,jsx,ts,tsx}': 'npm run test:related',
};

export default configs;
