import fs from 'fs';
import path from 'path';

export default {
  '*': 'prettier --ignore-unknown --write',
  '**/{networks,packages,wallets}/**/*.{js,jsx,ts,tsx}': 'eslint --fix',
  '**/{networks,packages,wallets}/**/*.{ts,tsx}': (files) => {
    const packages = new Set();

    files.forEach((file) => {
      let directory = path.dirname(file);

      while (directory !== process.cwd()) {
        if (fs.existsSync(path.join(directory, 'package.json'))) {
          packages.add(
            `tsc --noEmit --project ${path.relative(process.cwd(), directory)}`,
          );
          break;
        }
        directory = path.dirname(directory);
      }
    });

    return Array.from(packages);
  },
  '*.{js,jsx,ts,tsx}': 'npm run test:related',
};
