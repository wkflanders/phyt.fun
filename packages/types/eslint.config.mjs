import { config as baseConfig } from '@phyt/eslint-config/base';
import { URL } from 'node:url';

/** @type {import("eslint").Linter.Config} */
export default [
    ...baseConfig,
    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['eslint.config.mjs'],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir: new URL('.', import.meta.url).pathname
            }
        }
    }
];
