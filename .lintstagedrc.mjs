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
  '*.{js,jsx,ts,tsx}': (files) => {
    const foldersMap = {};

    files.forEach((file) => {
      const match = file.match(/^(packages|networks|wallets|apps)\/([^\/]+)\//);
      if (match) {
        const folder = match[1];
        const name = match[2];
        const key = `${folder}/${name}`;
        if (!foldersMap[key]) foldersMap[key] = [];
        foldersMap[key].push(file);
      }
    });

    const commands = [];
    const configFiles = [
      'vitest.config.ts',
      'vitest.config.js',
      'vitest.config.mjs',
      'vitest.config.cjs',
      'vitest.config.tsx',
    ];

    for (const [folderName, folderFiles] of Object.entries(foldersMap)) {
      const folderPath = path.join(process.cwd(), folderName);
      const foundConfig = configFiles.find((cfg) =>
        fs.existsSync(path.join(folderPath, cfg)),
      );

      let command = `npm run test:related -- ${folderFiles.join(' ')}`;

      if (foundConfig) {
        command += ` -- --config ${path.join(folderPath, foundConfig)}`;
      }

      console.log(`Running tests for ${folderName}:`, command);

      execSync(command, {
        stdio: 'inherit',
        cwd: folderPath,
      });
    }

    return commands;
  },
};

export default configs;
