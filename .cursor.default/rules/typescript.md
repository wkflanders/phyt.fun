---
description: 
globs: 
alwaysApply: true
---

# TypeScript Code Style Guide

This rule defines the TypeScript code style conventions for the project. Follow these rules for all TypeScript and React code.

## Parameter Passing

- **Always pass parameters as a single object** (named parameters pattern).

  **Example:**
  \```ts
  // Good
  function doSomething({ id, name }: { id: string; name: string }) { /* ... */ }
  // Bad
  function doSomething(id: string, name: string) { /* ... */ }
  \```

## Type Safety

- **Never use `any` as a type.** Use explicit types, interfaces, or `unknown` with type guards if necessary.
- **Reuse interfaces**

  **Example:**
  \```ts
  // types/user.ts
  export interface User { ... }
  // Usage
  import { User } from '@phyt/types';
  \```

## Imports

- **Use shorter imports** via path aliases, not relative paths like `../../components`.
- **Do not use index exports.** Use named exports and import modules directly.

  **Example:**
  \```ts
  // Good
  import { Button } from '@/components/shared/ui/button';
  // Bad
  import { Button } from '@/components/shared/ui';
  \```

## Functional Programming

- **Do not use classes.** Use functional methods and hooks.
- **Always wrap `if` statements in curly braces**, even for single-line blocks.

  **Example:**
  ```ts
  // Good
  if (isActive) {
    doSomething();
  }
  // Bad
  if (isActive) doSomething();
  \```

## Comments and Documentation

- **Do not comment obvious things.**
- **Do not explain changes in comments.**
- **Only document extraordinary changes or complex logic.**
- **Use JSDoc or a short description for top-level functions.**

## Forms and Schemas

- **Reuse schemas** for forms (e.g., Zod schemas) and validation logic. Place schemas in a `schemas/` directory if shared.

## Utility Functions

- **Place small utility functions under `utils/function-name.ts`**.

  **Example:**
  \```ts
  // utils/format-date.ts
  export function formatDate(date: Date): string { /* ... */ }
  \```

