const { FlatCompat } = require('@eslint/eslintrc');
const baseConfig = require('../../eslint.config.js');
const js = require('@eslint/js');
const typescriptEslintEslintPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptEslintParser = require('@typescript-eslint/parser');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...baseConfig,
  js.configs.recommended,
  ...compat.extends('plugin:@typescript-eslint/recommended', 'plugin:qwik/recommended'),
  { plugins: { '@typescript-eslint': typescriptEslintEslintPlugin } },
  {
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: ['apps/website/tsconfig.*?.json'],
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];
