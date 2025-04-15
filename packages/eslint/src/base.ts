import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turbo from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import path from 'node:path';

const { default: pluginImport } = await import('eslint-plugin-import');
const { default: pluginUnicorn } = await import('eslint-plugin-unicorn');

/** @type {import('eslint').Linter.Config[]} */
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
    js.configs.recommended,
    ...(tseslint.configs.strictTypeChecked as any),
    ...(tseslint.configs.stylisticTypeChecked as any),
    {
        files: ['**/*.{ts,tsx,cts,mts}'],
        languageOptions: {
            parser: tseslint.parser as any,
            parserOptions: {
                project: path.resolve(
                    process.cwd(),
                    '../../tsconfig.eslint.json'
                ),
                tsconfigRootDir: path.resolve(process.cwd(), '../../'),
                sourceType: 'module'
            }
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin as any,
            import: pluginImport as any
        },
        settings: {
            'import/resolver': {
                typescript: { alwaysTryTypes: true },
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
                'warn',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        ['parent', 'sibling', 'index'],
                        'object',
                        'type',
                        'unknown'
                    ],
                    pathGroups: [
                        {
                            pattern: 'react',
                            group: 'external',
                            position: 'before'
                        },
                        { pattern: '@/**', group: 'internal' }
                    ],
                    pathGroupsExcludedImportTypes: ['react', 'type'],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true }
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
        ...tseslint.configs.disableTypeChecked
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
