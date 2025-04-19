import { nextConfig } from '@phyt/eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config} */
export default [
    ...nextConfig,
    {
        // make the TypeScript plugin aware of the monorepo tsconfig
        languageOptions: {
            parserOptions: {
                project: path.resolve(__dirname, '../../tsconfig.eslint.json')
            }
        }
    }
];
