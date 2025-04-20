import { nextConfig } from '@phyt/eslint';
import next from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config} */
export default [
    ...nextConfig,
    {
        languageOptions: {
            parserOptions: {
                // use root ESLint tsconfig for workspace-wide resolution
                project: [path.resolve(__dirname, 'tsconfig.json')],
                tsconfigRootDir: path.resolve(__dirname)
            }
        }
    }
];
