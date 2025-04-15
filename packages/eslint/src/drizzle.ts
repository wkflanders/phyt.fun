import * as pluginDrizzleNs from 'eslint-plugin-drizzle'; // Use namespace import
import { baseConfig } from './base.js';

const resolvedPlugin = pluginDrizzleNs.default ?? pluginDrizzleNs;

/** @type {import("eslint").Linter.Config[]} */
export const drizzleConfig: import('eslint').Linter.Config[] = [
    ...baseConfig,
    {
        files: ['**/*.{ts,tsx,cts,mts}'],
        plugins: {
            drizzle: resolvedPlugin
        },
        rules: {
            ...resolvedPlugin.configs.recommended.rules
        }
    }
];
