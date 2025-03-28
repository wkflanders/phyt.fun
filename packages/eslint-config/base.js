import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import pluginImport from "eslint-plugin-import";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
 ... tseslint.configs.strictTypeChecked,
 ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      // parserOptions: {
      //   projectService: true,
      //   tsconfigRootDir: import.meta.dirname,
      // },
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
      import: pluginImport,
    },
    rules: {
      ...pluginImport.configs.recommended.rules,
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "import/first": "error",
      "import/no-duplicates": "error",
      "import/no-mutable-exports": "error",
      "import/no-named-default": "error",
      "import/no-self-import": "error",
      "import/no-webpack-loader-syntax": "error",
    },
  },
  {
    rules: {
      "no-console": [
        "warn",
        {
          allow: ["error", "warn"],
        },
      ],
      curly: "error",
      'spaced-comment': [
        'error',
        'always',
        {
          markers: ['/'],
        },
      ],
      "quotes": ["error", "single"],
      "semi": ["error", "all"],
      "indent": ["error", 2],
    },
  },
  {
    ignores: ["dist/**"],
  },
];
