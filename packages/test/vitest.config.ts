import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Determine which setup file to use based on whether we're in the test package itself
// or being imported by another package
let setupFile: string;

// Check if we're in the source directory (when running directly in test package)
if (existsSync(resolve(__dirname, 'src/setup.ts'))) {
    setupFile = resolve(__dirname, 'src/setup.ts');
}
// Check if we're in the dist directory (when this config is compiled)
else if (existsSync(resolve(__dirname, 'src/setup.js'))) {
    setupFile = resolve(__dirname, 'src/setup.js');
}
// Fallback to the built version in parent directory
else {
    setupFile = resolve(__dirname, '../src/setup.js');
}

export const base = defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: [setupFile],
        coverage: {
            reporter: ['text', 'lcov'],
            exclude: [
                'node_modules/**',
                'dist/**',
                '**/*.d.ts',
                '**/*.config.*',
                '**/coverage/**',
                '**/__tests__/**',
                '**/*.test.*',
                '**/*.spec.*'
            ]
        },
        // Respect tsconfig paths
        alias: {},
        isolate: true,
        pool: 'forks'
    },
    esbuild: {
        target: 'node18'
    }
});

export default base;
