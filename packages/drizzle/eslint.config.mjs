import path from 'node:path';
import { drizzleConfig } from '@phyt/eslint';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config} */
export default [
    ...drizzleConfig,
    {
        languageOptions: {
            parserOptions: {
                project: path.resolve(__dirname, 'tsconfig.json'),
                tsconfigRootDir: __dirname
            }
        },
        settings: {
            'import/resolver': {
                typescript: {
                    project: path.resolve(__dirname, 'tsconfig.json'),
                    alwaysTryTypes: true
                },
                node: true
            }
        }
    },
    {
        files: ['src/scripts/**/*.ts'],
        rules: {
            'no-console': 'off'
        }
    }
];
