import js from '@eslint/js';
import globals from 'globals';
import {defineConfig, globalIgnores} from 'eslint/config';

export default defineConfig([
  globalIgnores(['client/dist', 'node_modules']),
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {js},
    extends: ['js/recommended'],
    languageOptions: {globals: globals.browser},
    rules: {'no-unused-vars': ['error', {argsIgnorePattern: '^_'}]},
  },
  {
    files: ['server/**/*.js'],
    languageOptions: {globals: globals.node},
  },
]);
