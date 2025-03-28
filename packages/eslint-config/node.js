import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import globals from "globals";
import pluginNode from "eslint-plugin-node";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for Express servers.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nodeConfig = [
  ...baseConfig,
  {
    ...pluginNode.configs.flat.recommended,
    languageOptions: {
      ...pluginNode.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.node,
      },
    },
    settings: {
        "import/resolver": {
          typescript: true,
      },
    },
  },
  {
    plugins: {
      node: pluginNode,
    },
    rules: {
      "node/handle-callback-err": ["error", "^(err|error)$"],
      "node/no-deprecated-api": "error",
      "node/no-exports-assign": "error",
      "node/no-new-require": "error",
      "node/no-path-concat": "error",
      "node/prefer-global/buffer": ["error", "never"],
      "node/prefer-global/process": ["error", "never"],
      "node/process-exit-as-throw": "error",
    },
  },
];
