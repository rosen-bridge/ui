import pluginJs from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  // General Ignore Patterns
  {
    ignores: ['**/dist/*'],
  },

  // Base Configuration for JS/TS Files
  {
    files: ['{networks,packages,wallets}/**/*.{js,jsx,ts,tsx}'],
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
      'packages/public-status-logic/**/*.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Node-Specific Globals
  {
    files: [
      'networks/**/*.{js,jsx,ts,tsx}',
      'packages/asset-calculator/**/*.{js,jsx,ts,tsx}',
      'packages/public-status-logic/**/*.{js,jsx,ts,tsx}',
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
    files: ['packages/ui-kit/**/*.{js,jsx,ts,tsx}'],
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
    rules: {
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true },
      ],
    },
  },

  // Integrate Prettier for Formatting
  prettier,
];
