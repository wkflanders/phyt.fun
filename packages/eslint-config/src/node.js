import globals from "globals";
import pluginNode from "eslint-plugin-node";
import { config as baseConfig } from "./base.js";

/** @type {import("eslint").Linter.FlatConfig[]} */
export const nodeConfig = [
  ...baseConfig,
  {
    files: ["**/*.{js,cjs,mjs,ts,cts,mts}"],
    plugins: {
        node: pluginNode
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
        // Recommended rules are often a good starting point
        // but eslint-plugin-node doesn't export a simple recommended rules object for flat config easily
        // Manually add desired rules:
        "node/handle-callback-err": ["error", "^(err|error)$"],
        "node/no-deprecated-api": "error",
        "node/no-exports-assign": "error",
        "node/no-new-require": "error",
        "node/no-path-concat": "error",
        "node/no-missing-import": "off", // Often conflicts with TS/module bundlers
        "node/no-missing-require": "off", // Often conflicts with TS/module bundlers
        "node/no-unpublished-import": "off", // Can be noisy in monorepos
        "node/no-unpublished-require": "off", // Can be noisy in monorepos
        "node/no-unsupported-features/es-syntax": "off", // TS handles syntax support
        "node/no-unsupported-features/es-builtins": "error",
        "node/no-unsupported-features/node-builtins": "error",
        "node/prefer-global/buffer": ["error", "never"],
        "node/prefer-global/process": ["error", "never"],
        "node/process-exit-as-throw": "error",
        "node/shebang": "error", // If you write CLI scripts
    },
  },
];