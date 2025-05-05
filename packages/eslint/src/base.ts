import eslintJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turbo from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import parser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pluginImport from 'eslint-plugin-import';
import pluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import type { Linter } from 'eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const ESLINT_TSCONFIG = path.resolve(REPO_ROOT, 'tsconfig.eslint.json');

export const baseConfig: import('eslint').Linter.Config[] = [
    {
        ignores: [
            '**/dist/**',
            '**/build/**',
            '**/.turbo/**',
            '**/node_modules/**',
            'drizzle.config.ts',
            'eslint.config.js',
            'eslint.config.mjs',
            'eslint.config.cjs',
            // 'packages/eslint/**',
            'packages/contracts/**',
            'packages/contracts/**/*',
            'packages/drizzle/migrations/**/*'
        ]
    },
    eslintJs.configs.recommended,
    ...(tseslint.config({
        files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
        extends: [
            ...tseslint.configs.recommendedTypeChecked,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked
        ],
        languageOptions: {
            parser, // Keep the explicit parser if your setup requires it
            parserOptions: {
                project: ESLINT_TSCONFIG,
                tsconfigRootDir: REPO_ROOT,
                sourceType: 'module',
                ecmaVersion: 'latest'
            }
        },
        rules: {
            // '@typescript-eslint/no-unsafe-assignment': 'off',
            // '@typescript-eslint/no-unsafe-call': 'off',
            // '@typescript-eslint/no-unsafe-member-access': 'off',
            // '@typescript-eslint/no-unsafe-return': 'off',
            // '@typescript-eslint/no-unsafe-argument': 'off',
            // Optional: If you see errors from these too
            // '@typescript-eslint/no-unsafe-declaration-merging': 'off',
            // '@typescript-eslint/no-unsafe-enum-comparison': 'off',

            '@typescript-eslint/no-floating-promises': [
                'off',
                { ignoreVoid: true }
            ],
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': [
                'off',
                { argsIgnorePattern: '^_' }
            ],
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }) as Linter.Config[]),
    {
        files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
        plugins: {
            import: pluginImport
        },
        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: ESLINT_TSCONFIG
                },
                node: true
            }
        },
        rules: {
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        ['parent', 'sibling'],
                        'index',
                        'object',
                        'type'
                    ],
                    pathGroups: [
                        {
                            pattern: '@phyt/**',
                            group: 'internal',
                            position: 'before'
                        },
                        {
                            pattern:
                                '{react,react-dom,react-dom/**,next,next/**}',
                            group: 'external',
                            position: 'before'
                        },
                        {
                            pattern: '{express,express/**,node:*,@node/*}',
                            group: 'builtin',
                            position: 'before'
                        },
                        {
                            pattern: '@/**',
                            group: 'internal',
                            position: 'before'
                        },
                        {
                            pattern:
                                '{@mui/**,**/@radix-ui/**,shadcn-ui/**,tailwind*,clsx,class-variance-authority}',
                            group: 'external',
                            position: 'after'
                        },
                        {
                            pattern:
                                '{@tanstack/**,zod,jotai,valtio,swr,axios,drizzle-orm/**,viem,wagmi}',
                            group: 'external',
                            position: 'after'
                        },
                        {
                            pattern: '{@/components/ui/**,~/*/ui/**}',
                            group: 'internal',
                            position: 'after'
                        }
                    ],
                    pathGroupsExcludedImportTypes: [
                        'builtin',
                        'object',
                        'type'
                    ],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                    warnOnUnassignedImports: true
                }
            ],
            'import/no-duplicates': 'error',
            'import/no-useless-path-segments': [
                'error',
                { noUselessIndex: true }
            ],
            'import/no-relative-parent-imports': 'off',
            'import/consistent-type-specifier-style': [
                'error',
                'prefer-top-level'
            ],
            'import/first': 'error',
            'no-restricted-imports': [
                'error',
                { patterns: ['**/../**/', '../../*'] }
            ]
        }
    },
    {
        files: ['**/*.{js,cjs}'],
        languageOptions: {
            globals: {
                ...globals.node,
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly'
            }
        },
        rules: {
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/dot-notation': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off'
        }
    },
    {
        plugins: { turbo },
        rules: { 'turbo/no-undeclared-env-vars': 'warn' }
    },
    {
        plugins: { unicorn: pluginUnicorn as any },
        rules: { 'unicorn/prefer-node-protocol': 'warn' }
    },
    {
        rules: {
            'no-console': ['warn', { allow: ['error', 'warn'] }],
            curly: ['error', 'multi-line'],
            'no-confusing-arrow': ['warn', { allowParens: true }],
            // Will come back to this
            // complexity: ['warn', 15]
            'no-nested-ternary': 'off',
            'no-unused-expressions': [
                'warn',
                { allowShortCircuit: true, allowTernary: true }
            ]
        }
    },
    eslintConfigPrettier
];
