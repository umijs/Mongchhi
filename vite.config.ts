import { defineConfig } from 'vitest/config';

// https://vitest.dev/config/
export default defineConfig({
  test: {
    globals: true,
    exclude: [
      'node_modules/**',
      '**/node_modules/**',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'e2e',
    ],
  },
});
