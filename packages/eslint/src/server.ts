import { config as baseConfig } from './base.js';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import("eslint").Linter.Config[]} */
export const serverConfig: import('eslint').Linter.Config[] = [
    ...baseConfig,
    eslintConfigPrettier
];
