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
            'dist/**',
            'build/**',
            '.turbo/**',
            'node_modules/**',
            '.next/**',
            'eslint.config.js',
            'eslint.config.cjs',
            'packages/eslint'
        ]
    },
    eslint.configs.recommended,
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.stylisticTypeChecked,
    ...tseslint.configs.strictTypeChecked, // <-- most important line, max strictness. if any of th rules don't work for your codebase as being too strict, disable them one by one, but it is worth trying to crank up strictness to max
    pluginImport.flatConfigs.recommended,
    {
        files: ['**/*.{ts,tsx,cts,mts}'],
        languageOptions: {
            parser,
            parserOptions: {
                project: [ESLINT_TSCONFIG],
                tsconfigRootDir: REPO_ROOT,
                sourceType: 'module'
            }
        },
        plugins: {
            '@typescript-eslint': tseslint as any,
            import: pluginImport as any
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
            '@typescript-eslint/no-floating-promises': [
                'error',
                { ignoreVoid: true }
            ],
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/explicit-module-boundary-types': 'warn',
            'import/order': [
                'error',
                {
                    named: true,
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc'
                    },
                    groups: [
                        'builtin',
                        ['external', 'internal'],
                        ['parent', 'sibling', 'index', 'object'],
                        'type'
                    ],
                    pathGroups: [
                        {
                            group: 'builtin',
                            pattern: 'react',
                            position: 'before'
                        },
                        {
                            group: 'external',
                            pattern: '@mui/icons-material',
                            position: 'after'
                        }
                    ]
                }
            ],
            'import/no-duplicates': 'warn',
            'import/no-useless-path-segments': [
                'warn',
                { noUselessIndex: true }
            ],
            'import/no-relative-parent-imports': 'off',
            'import/consistent-type-specifier-style': [
                'warn',
                'prefer-top-level'
            ],
            'import/first': 'error',
            'no-restricted-imports': ['error', { patterns: ['../*'] }]
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
            complexity: ['warn', 15],
            'no-nested-ternary': 'warn',
            'no-unused-expressions': [
                'warn',
                { allowShortCircuit: true, allowTernary: true }
            ]
        }
    },
    eslintConfigPrettier
];
