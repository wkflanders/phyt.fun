import * as jsxA11yNs from 'eslint-plugin-jsx-a11y';
import * as tailwindNs from 'eslint-plugin-tailwindcss';
import * as tanstackNs from '@tanstack/eslint-plugin-query';
import * as reactHooksNs from 'eslint-plugin-react-hooks';
import * as reactNs from 'eslint-plugin-react';
import * as nextNs from '@next/eslint-plugin-next';
import globals from 'globals';

import { baseConfig } from './base.js';

/*  Resolve plugin objects (default export vs. namespace)                     */
const jsxA11y = jsxA11yNs;
const tailwind = tailwindNs;
const tanstack = tanstackNs.default ?? tanstackNs;
const react = reactNs;
const reactHooks = reactHooksNs;
const nextPlugin = nextNs.default ?? nextNs;

/* Helper to pick the first existing preset key */
const pickPreset = (plugin: any, keys: string[]) =>
    keys.map((k) => plugin.configs?.[k]).find(Boolean) ?? {};

/* Presets that actually exist in current plugin versions */
const tailwindPreset = pickPreset(tailwind, ['recommended']);
const reactPreset = pickPreset(react, ['flat/recommended', 'recommended']);
const tanstackPreset = pickPreset(tanstack, ['recommended']);

/*  Next‑JS flat config                                                       */

export const nextConfig: import('eslint').Linter.Config[] = [
    {
        ignores: [
            '**/.next/**',
            'next-env.d.ts',
            'postcss.config.mjs',
            'tailwind.config.ts',
            'next-env.d.ts',
            'next.config.js',
            'src/components/ui/**',
            'src/env.ts',
            'src/hooks/use-toast.ts',
            'src/hooks/use-mobile.tsx'
        ]
    },
    ...baseConfig,

    /* Tailwind preset (if present) ------------------------------------------ */
    ...(tailwindPreset ? [tailwindPreset] : []),

    /* React language‑options + globals -------------------------------------- */
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ...reactPreset.languageOptions,
            globals: {
                ...globals.browser,
                ...globals.node,
                React: 'readonly'
            }
        },
        plugins: { react },
        settings: { react: { version: 'detect' } },
        rules: {
            ...reactPreset.rules,
            'react/react-in-jsx-scope': 'off'
        }
    },

    /* Disable explicit return-type requirement for Next.js route and layout files during initial fixup */
    {
        files: ['src/app/**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/explicit-module-boundary-types': 'off'
        }
    },

    /* Next‑plugin rules ------------------------------------------------------ */
    {
        plugins: { '@next/next': nextPlugin }
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        rules: {
            ...(nextPlugin.configs?.recommended?.rules ?? {}),
            ...(nextPlugin.configs?.['core-web-vitals']?.rules ?? {})
        }
    },

    /* React‑Hooks preset ----------------------------------------------------- */
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: { 'react-hooks': reactHooks },
        settings: { react: { version: 'detect' } },
        rules: { ...(reactHooks.configs?.recommended?.rules ?? {}) }
    },

    /* JSX‑a11y preset -------------------------------------------------------- */
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: { 'jsx-a11y': jsxA11y },
        rules: { ...(jsxA11y.configs?.recommended?.rules ?? {}) }
    },

    /* TanStack Query preset -------------------------------------- */
    ...(tanstackPreset
        ? [
              {
                  files: ['**/*.{js,jsx,ts,tsx}'],
                  plugins: { '@tanstack/query': tanstack },
                  rules: { ...tanstackPreset.rules }
              }
          ]
        : [])
];
