import { defineConfig, mergeConfig } from 'vitest/config';
import { base } from '@phyt/test/vitest.config';

export default mergeConfig(
    base,
    defineConfig({
        test: {
            include: ['src/**/__tests__/**/*.test.ts', 'src/**/*.test.ts'],
            exclude: ['**/node_modules/**', '**/dist/**']
        }
    })
);
