import type { ViteUserConfig } from 'vitest/config';

export const baseVitestConfig: ViteUserConfig = {
    test: {
        globals: true,
        setupFiles: ['@phyt/test/setup'],
        coverage: { reporter: ['text', 'html'] },
        environment: 'happy-dom'
    }
};

// Re-export defineConfig for convenience
export { defineConfig } from 'vitest/config';
