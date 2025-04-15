import pluginDrizzle from 'eslint-plugin-drizzle';
import eslintConfigPrettier from 'eslint-config-prettier';
import { config as baseConfig } from './base.js';

/** @type {import("eslint").Linter.Config[]} */
export const drizzleConfig: import('eslint').Linter.Config[] = [
    ...baseConfig,
    {
        files: ['**/*.{ts,tsx,cts,mts}'],
        plugins: {
            drizzle: pluginDrizzle
        },
        rules: {
            ...pluginDrizzle.configs.recommended.rules
        }
    },
    eslintConfigPrettier
];
