import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serverConfig } from '@phyt/eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const ESLINT_TSCONFIG = path.resolve(REPO_ROOT, 'tsconfig.eslint.json');

/** @type {import("eslint").Linter.Config} */
export default [
    ...serverConfig,
    {
        languageOptions: {
            parserOptions: {
                project: ESLINT_TSCONFIG,
                tsconfigRootDir: REPO_ROOT
            }
        },
        settings: {
            'import/resolver': {
                typescript: {
                    project: ESLINT_TSCONFIG,
                    alwaysTryTypes: true
                },
                node: true
            }
        }
    },
    {
        files: ['src/scripts/**/*.ts'],
        rules: { 'no-console': 'off' }
    },
    {
        files: ['src/services/**/*.ts'],
        rules: { 'no-console': ['error', { allow: ['error', 'warn', 'log'] }] }
    }
];
