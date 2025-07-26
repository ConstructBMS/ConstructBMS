import js from '@eslint/js';

export default [
  {
    ignores: ['**/*'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ...js.configs.recommended,
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
    },
  },
]; 