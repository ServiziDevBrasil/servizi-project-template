import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['.next/**', 'coverage/**', 'playwright-report/**', 'test-results/**', 'profiles/**'],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        process: 'readonly'
      }
    }
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
