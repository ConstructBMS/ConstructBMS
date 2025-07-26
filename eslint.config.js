import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import security from 'eslint-plugin-security';
import importPlugin from 'eslint-plugin-import';
import typescriptSortKeys from 'eslint-plugin-typescript-sort-keys';

export default [
  // Global ignores
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      '*.min.js',
      'public/sw.js', // Service worker has different globals
      'scripts/**/*.js', // Script files may have different requirements
      '**/*.test.{js,jsx,ts,tsx}', // Test files
      '**/*.spec.{js,jsx,ts,tsx}', // Spec files
    ],
  },
  
  // JS/JSX config
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'security': security,
      'import': importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': 'off', // Disabled to reduce noise
      'no-undef': 'error',
    },
  },
  
  // TS/TSX config for source files
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: process.cwd(),
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'typescript-sort-keys': typescriptSortKeys,
    },
    rules: {
      ...tseslint.configs.recommendedTypeChecked.rules,
      'typescript-sort-keys/interface': 'off', // Disabled to reduce noise
      'typescript-sort-keys/string-enum': 'off', // Disabled to reduce noise
      '@typescript-eslint/no-unused-vars': 'off', // Disabled to reduce noise
      '@typescript-eslint/no-explicit-any': 'off', // Disabled to reduce noise - too many in codebase
      '@typescript-eslint/no-unsafe-assignment': 'off', // Disabled for now
      '@typescript-eslint/no-unsafe-member-access': 'off', // Disabled for now
      '@typescript-eslint/no-unsafe-call': 'off', // Disabled for now
      '@typescript-eslint/no-unsafe-return': 'off', // Disabled for now
      '@typescript-eslint/restrict-template-expressions': 'off', // Disabled for now
      '@typescript-eslint/no-floating-promises': 'off', // Disabled for now
      '@typescript-eslint/require-await': 'off', // Disabled for now
    },
  },
  
  // TS/TSX config for config files (without project reference)
  {
    files: ['*.config.{ts,js}', 'vite.config.*', 'postcss.config.*', 'tailwind.config.*'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  
  // Test files
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
