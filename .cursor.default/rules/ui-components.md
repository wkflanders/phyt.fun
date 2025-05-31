---
description: 
globs: *.tsx
alwaysApply: false
---

# UI Components from @ui (Shadcn UI)

## Overview

All components imported from `apps/web/src/components/ui` are @Shadcn UI primitives. These components serve as the foundation for building user interfaces in this codebase.

## Usage Guidelines

- **Always prefer importing UI primitives from @@/components/shared/ui if available**
- **Do not duplicate UI logic**—extend or compose existing @@/components/shared/ui components if additional functionality is needed.
- **Follow the design system**: All @@/components/shared/ui components are styled with Tailwind CSS and follow the project's design tokens and accessibility standards.
- **Use named imports**: Example:
  \```tsx
  import { Button } from '@/components/shared/ui/button';
  \```
- **Reference the implementation**: If you need to customize or debug a component, check `@/components/shared/ui`

## When to use `apps/web/src/components/ui` components

- For all buttons, forms, dialogs, menus, and other UI primitives, use the corresponding @@/components/shared/ui component.
- For custom UI, compose with @@/components/shared/ui components as building blocks.
- Only use third-party or custom UI code if a suitable @@/components/shared/ui component does not exist and cannot be composed.

## Example

\```tsx
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Dialog } from '@/components/shared/ui/dialog';

function ExampleForm() {
  return (
    <Dialog>
      <form className="flex flex-col gap-4">
        <Input label="Email" type="email" />
        <Button type="submit">Submit</Button>
      </form>
    </Dialog>
  );
}
\```

## Best Practices

- Use composition and props to extend functionality.
- Follow accessibility and responsive design patterns as established in the codebase.
- Prefer functional, declarative usage and avoid class-based components.

---

**See also:** [tailwind.mdc](mdc:.cursor/rules/tailwind.mdc), [react-next-shadcn.mdc](mdc:.cursor/rules/react-next-shadcn.mdc)


