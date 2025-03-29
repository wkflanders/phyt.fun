import js from "@eslint/js";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import pluginImport from "eslint-plugin-import";
import pluginUnicorn from "eslint-plugin-unicorn";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import("eslint").Linter.Config[]} */
export const config = [
  {
    ignores: [
      "dist/**",
      "build/**",
      ".turbo/**",
      "node_modules/**",
      ".next/**",
      "eslint.config.js",
      // "eslint.config.mjs",
      "eslint.config.cjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ["**/*.{ts,tsx,cts,mts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: pluginImport,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
        node: true,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: true }],
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "type",
            "unknown",
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "type"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-duplicates": "warn",
      "import/no-useless-path-segments": ["warn", { noUselessIndex: true }],
      "import/no-relative-parent-imports": "warn",
      "import/consistent-type-specifier-style": ["warn", "prefer-top-level"],
      "import/first": "error",
      "import/newline-after-import": "warn",
    },
  },
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
     plugins: {
        unicorn: pluginUnicorn,
     },
     rules: {
        "unicorn/prefer-node-protocol": "warn",
     },
  },
  {
    rules: {
      "no-console": ["warn", { allow: ["error", "warn"] }],
      curly: ["error", "multi-line"],
      "no-confusing-arrow": ["warn", { "allowParens": true }],
      "complexity": ["warn", 15],
      "no-nested-ternary": "warn",
      "no-unused-expressions": ["warn", { "allowShortCircuit": true, "allowTernary": true }],
    },
  },
];