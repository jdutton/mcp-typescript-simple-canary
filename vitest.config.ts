import { defineConfig } from 'vitest/config';

/**
 * Vitest Configuration for Canary Project
 *
 * This configuration is for a standalone project that uses
 * published @mcp-typescript-simple npm packages (not workspace packages).
 *
 * NO PATH ALIASES - uses actual node_modules packages to test
 * interface stability against published versions.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        '**/*.test.ts',
        '**/*.config.ts',
      ],
    },
  },
  // NO resolve.alias configuration - use published npm packages
});
