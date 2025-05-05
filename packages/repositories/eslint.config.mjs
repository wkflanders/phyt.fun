import { baseConfig } from '@phyt/eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const ESLINT_TSCONFIG = path.resolve(REPO_ROOT, 'tsconfig.eslint.json');

/** @type {import("eslint").Linter.Config} */
export default [
    ...baseConfig,
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
    }
];
