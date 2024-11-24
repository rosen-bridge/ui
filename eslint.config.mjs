import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import pluginJs from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['**/dist/*'],
  },
  {
    files: [
      'networks/**/*.{js,jsx,ts,tsx}',
      'packages/**/*.{js,jsx,ts,tsx}',
      'wallets/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...typescriptEslint.configs.recommended.rules,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: [
      'networks/**/*.{js,jsx,ts,tsx}',
      'packages/asset-calculator/**/*.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: [
      'packages/common-hooks/**/*.{js,jsx,ts,tsx}',
      'packages/constants/**/*.{js,jsx,ts,tsx}',
      'packages/icons/**/*.{js,jsx,ts,tsx}',
      'packages/swr-helpers/**/*.{js,jsx,ts,tsx}',
      'packages/swr-mock/**/*.{js,jsx,ts,tsx}',
      'packages/types/**/*.{js,jsx,ts,tsx}',
      'packages/utils/**/*.{js,jsx,ts,tsx}',
      'wallets/**/*.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: [
      'packages/shared-contexts/**/*.{js,jsx,ts,tsx}',
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
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  prettier,
];
