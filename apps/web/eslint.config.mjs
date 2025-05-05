import { nextConfig } from '@phyt/eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_TSCONFIG = path.resolve(__dirname, 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
export default [
    ...nextConfig,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                project: LOCAL_TSCONFIG,
                tsconfigRootDir: __dirname
            }
        }
        // Shared config should handle resolver based on root tsconfig.eslint.json
    }
];
