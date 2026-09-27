import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**', 'profiles/**'],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
        window: 'readonly'
      }
    }
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
