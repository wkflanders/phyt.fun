import { defineConfig, baseVitestConfig } from '@phyt/test/config';
import { mergeConfig } from 'vitest/config';

export default mergeConfig(
    baseVitestConfig,
    defineConfig({
        test: {
            include: [
                '__tests__/**/*.test.ts',
                'src/**/__tests__/**/*.test.ts',
                'src/**/*.test.ts'
            ],
            exclude: ['**/node_modules/**', '**/dist/**']
        }
    })
);
