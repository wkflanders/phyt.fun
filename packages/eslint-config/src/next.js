import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import pluginNext from "@next/eslint-plugin-next";
import { config as baseConfig } from "./base.js";

/** @type {import("eslint").Linter.FlatConfig[]} */
export const nextJsConfig = [
  ...baseConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "@next/next": pluginNext,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,

      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-access-state-in-setstate": "error",
      "react/no-array-index-key": "warn",
      "react/no-children-count": "warn",
      "react/no-children-for-each": "warn",
      "react/no-children-map": "warn",
      "react/no-children-only": "warn",
      "react/no-children-to-array": "warn",
      "react/no-clone-element": "warn",
      "react/no-comment-textnodes": "warn",
      "react/no-component-will-mount": "error",
      "react/no-component-will-receive-props": "error",
      "react/no-component-will-update": "error",
      "react/no-context-provider": "warn",
      "react/no-create-ref": "error",
      "react/no-default-props": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-duplicate-jsx-props": "warn",
      "react/jsx-key": "error", // replaces no-missing-key, no-duplicate-key etc.
      "react/no-forward-ref": "warn",
      "react/no-implicit-key": "warn", // Consider removing if jsx-key is sufficient
      "react/no-nested-component-definitions": "error",
      "react/no-redundant-should-component-update": "error",
      "react/no-set-state-in-component-did-mount": "warn",
      "react/no-set-state-in-component-did-update": "warn",
      "react/no-set-state-in-component-will-update": "warn",
      "react/no-string-refs": "error",
      "react/no-unsafe-component-will-mount": "warn",
      "react/no-unsafe-component-will-receive-props": "warn",
      "react/no-unsafe-component-will-update": "warn",
      "react/no-unstable-context-value": "warn",
      "react/no-unstable-default-props": "warn",
      "react/no-unused-class-component-members": "warn",
      "react/no-unused-state": "warn",
      "react/no-use-context": "warn",
      "react/no-useless-forward-ref": "warn",
      // 'react/use-jsx-vars': 'warn', // Covered by recommended

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];