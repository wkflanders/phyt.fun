import eslintConfigPrettier from 'eslint-config-prettier';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import tailwindPlugin from 'eslint-plugin-tailwindcss';
import queryPlugin from '@tanstack/eslint-plugin-query';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import pluginNext from '@next/eslint-plugin-next';
import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nextJsConfig: import('eslint').Linter.Config[] = [
    ...baseConfig,
    tailwindPlugin.configs['flat/recommended'] as any,
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        ...pluginReact.configs.flat.recommended,
        languageOptions: {
            ...pluginReact.configs.flat.recommended?.languageOptions,
            globals: {
                ...globals.browser,
                ...globals.node,
                React: 'readonly'
            }
        },
        settings: {
            react: {
                version: 'detect'
            }
        },
        rules: {
            ...pluginReact.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/function-component-definition': [
                'warn',
                {
                    namedComponents: 'arrow-function',
                    unnamedComponents: 'arrow-function'
                }
            ],
            'react/jsx-curly-brace-presence': [
                'warn',
                {
                    props: 'never',
                    children: 'never',
                    propElementValues: 'always'
                }
            ],
            'tailwindcss/no-custom-classname': 'warn',
            'tailwindcss/classnames-order': 'warn'
        }
    },
    /*
  NOTE:
    Next is surprisingly sensitive on how it detects the availability of its next eslint plugin.
    So any scoping to specific file types or ignoring certain dir. must take this into account.
    i.e. No scoping to js, jsx, ts, tsx for the actual plugin declaration, but can scope on the ruleset (as seen below).
         And using an ignore config object requires that the actual eslint.config.{mjs, cjs, js} file that's loaded
         not be ignored (this is kinda a duh).
  */
    {
        plugins: {
            '@next/next': pluginNext
        }
    },

    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        rules: {
            ...pluginNext.configs.recommended.rules,
            ...pluginNext.configs['core-web-vitals'].rules
        }
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            'react-hooks': pluginReactHooks
        },
        settings: { react: { version: 'detect' } },
        rules: {
            ...pluginReactHooks.configs.recommended.rules
        }
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            'jsx-a11y': jsxA11yPlugin
        },
        rules: {
            ...jsxA11yPlugin.configs.recommended.rules
        }
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            '@tanstack/query': queryPlugin
        },
        rules: {
            ...queryPlugin.configs.recommended.rules
        }
    },
    eslintConfigPrettier
];
