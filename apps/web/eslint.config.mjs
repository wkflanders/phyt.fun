import { nextJsConfig } from '@phyt/eslint-config/next-js';
import nextPlugin from '@next/eslint-plugin-next';
 
/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    plugins: {
      '@next/next': nextPlugin,
    }
  },
  // Other configurations
];