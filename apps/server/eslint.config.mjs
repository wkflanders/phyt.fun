import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serverConfig } from '@phyt/eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config} */
export default [
    ...serverConfig,
    {
        languageOptions: {
            parserOptions: {
                // use root ESLint tsconfig for workspace-wide resolution
                project: path.resolve(__dirname, '../../tsconfig.eslint.json')
            }
        },
        settings: {
            'import/resolver': {
                typescript: {
                    // use root tsconfig for resolving workspace packages
                    project: path.resolve(
                        __dirname,
                        '../../tsconfig.eslint.json'
                    ),
                    alwaysTryTypes: true
                },
                // also allow Node module resolution
                node: true
            }
        }
    },
    {
        // allow console statements in scripts
        files: ['src/scripts/**/*.ts'],
        rules: {
            'no-console': 'off'
        }
    },
    {
        files: ['src/services/**/*.ts'],
        rules: {
            'no-console': ['error', { allow: ['error', 'warn', 'log'] }]
        }
    }
];
