import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turbo from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import parser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pluginImport from 'eslint-plugin-import';
import pluginUnicorn from 'eslint-plugin-unicorn';

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
            'packages/eslint/**',
            'packages/contracts/**',
            'packages/contracts/**/*',
            'packages/database/migrations/**/*'
        ]
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    pluginImport.flatConfigs.recommended,
    {
        files: ['**/*.{ts,tsx,cts,mts}'],
        languageOptions: {
            parser,
            parserOptions: {
                project: [ESLINT_TSCONFIG],
                tsconfigRootDir: REPO_ROOT,
                sourceType: 'module',
                ecmaVersion: 'latest'
            }
        },
        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: [ESLINT_TSCONFIG]
                },
                node: true
            }
        },
        rules: {
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            // Optional: If you see errors from these too
            '@typescript-eslint/no-unsafe-declaration-merging': 'off',
            '@typescript-eslint/no-unsafe-enum-comparison': 'off',

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
            '@typescript-eslint/no-explicit-any': 'off',
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
                            pattern:
                                '{react,react-dom,react-dom/**,next,next/**}',
                            group: 'external',
                            position: 'before'
                        },
                        {
                            pattern:
                                '{express,express/**,node:http,node:https}',
                            group: 'external',
                            position: 'before'
                        },
                        {
                            pattern: '@phyt/**',
                            group: 'internal',
                            position: 'before'
                        },
                        {
                            pattern: '@/**',
                            group: 'internal',
                            position: 'before'
                        },
                        {
                            pattern: '~/**',
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
                                '{@tanstack/**,zod,jotai,valtio,swr,axios,drizzle-orm/**}',
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
                        'external',
                        'object',
                        'type'
                    ],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true
                    },
                    warnOnUnassignedImports: true
                }
            ],
            'import/no-duplicates': 'error',
            'import/no-useless-path-segments': [
                'error',
                { noUselessIndex: true }
            ],
            'import/no-relative-parent-imports': 'off', // Often disabled in monorepos
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
        rules: {
            // --- Turn OFF TypeScript-specific rules for JS files ---
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
            '@typescript-eslint/explicit-function-return-type': 'off',

            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'dot-notation': ['warn', { allowKeywords: true }]
        }
    },
    {
        files: ['**/*.mjs'],
        languageOptions: {
            parser
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
