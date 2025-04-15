import { baseConfig } from '@phyt/eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
// import { URL } from 'node:url';

/** @type {import("eslint").Linter.Config} */
export default [
    ...baseConfig,
    // {
    //     files: ['**/*.ts', '**/*.tsx'],
    //     ignores: ['eslint.config.mjs'],
    //     languageOptions: {
    //         parserOptions: {
    //             project: ['./tsconfig.json'],
    //             tsconfigRootDir: new URL('.', import.meta.url).pathname
    //         }
    //     }
    // },
    eslintConfigPrettier
];
