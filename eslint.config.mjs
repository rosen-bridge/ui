import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  // General Ignore Patterns
  {
    ignores: ['**/.next/*', '**/dist/*', '**/out/*'],
  },

  // Base Configuration for JS/TS Files
  {
    files: [
      '{networks,packages,wallets,apps/rosen-service2}/**/*.{js,jsx,ts,tsx}',
      'apps/{guard,rosen,watcher}/{app,src}/**/*.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...typescriptEslint.configs.recommended.rules,
    },
  },

  // Browser-Specific Globals
  {
    files: ['{packages,wallets}/**/*.{js,jsx,ts,tsx}'],
    ignores: [
      'packages/asset-calculator/**/*.{js,jsx,ts,tsx}',
      'packages/public-status/**/*.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Node-Specific Globals
  {
    files: [
      'apps/rosen-service2/**/*.{js,jsx,ts,tsx}',
      'networks/**/*.{js,jsx,ts,tsx}',
      'packages/asset-calculator/**/*.{js,jsx,ts,tsx}',
      'packages/public-status/**/*.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        vi: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        fit: 'readonly',
        it: 'readonly',
        jest: 'readonly',
        test: 'readonly',
      },
    },
  },

  // React-Specific Rules and Plugins
  {
    files: [
      'apps/{guard,rosen,watcher}/{app,src}/**/*.{js,jsx,ts,tsx}',
      'packages/ui-kit/**/*.{js,jsx,ts,tsx}',
    ],
    plugins: {
      'react-refresh': reactRefresh,
      'react-hooks': reactHooks,
    },
    rules: {
      'react-refresh/only-export-components': 'warn',
      ...reactHooks.configs.recommended.rules,
    },
  },

  {
    files: ['packages/swr-helpers/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },

  // Additional Global Rules
  {
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true },
      ],
    },
  },

  ...compat.config({
    extends: ['next/core-web-vitals'],
    settings: {
      next: {
        rootDir: ['apps/guard', 'apps/rosen', 'apps/watcher'],
      },
    },
  }),

  // Integrate Prettier for Formatting
  prettier,
];

export default eslintConfig;
