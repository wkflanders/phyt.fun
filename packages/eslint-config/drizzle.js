import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import pluginDrizzle from "eslint-plugin-drizzle";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for Express servers.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const drizzleConfig = [
  ...baseConfig,
  {
    settings: {
        "import/resolver": {
          typescript: true,
      },
    },
  },
  {
    plugins: {
      drizzle: pluginDrizzle,
    },
    rules: {
      ...drizzle.configs.recommended.rules,
    },
  },
];
