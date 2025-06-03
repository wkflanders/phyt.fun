# @phyt/test

A comprehensive testing package for the Phyt.fun monorepo, providing utilities, mocks, and configurations for unit testing.

## Features

- Pre-configured Vitest setup
- Common test utilities and mocks
- Testing library integration
- Type-safe testing helpers

## Installation

This package is internal to the monorepo and included via workspace dependencies.

```json
{
    "devDependencies": {
        "@phyt/test": "workspace:*"
    }
}
```

## Usage

### Basic Setup

Import utilities directly from the package:

```typescript
import { describe, it, expect, createMockUser } from '@phyt/test';
```

### Vitest Configuration

Use the pre-configured Vitest setup in your `vitest.config.ts`:

```typescript
import { base } from '@phyt/test/vitest.config';

export default base;
```

### Available Utilities

#### Mock Creators

- `createMockUser()` - Creates a mock user object for testing
- `createMockRequest(overrides?)` - Creates a mock HTTP request
- `createMockResponse()` - Creates a mock HTTP response

#### Re-exported Utilities

- All Vitest functions: `vi`, `describe`, `it`, `expect`, `beforeEach`, `afterEach`, etc.
- Testing Library DOM utilities

### Example Test

```typescript
import { describe, it, expect, vi, createMockUser } from '@phyt/test';

describe('User Service', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch user data', async () => {
        const mockUser = createMockUser();
        const mockFetch = vi.fn().mockResolvedValue(mockUser);

        const result = await mockFetch();

        expect(result).toEqual(mockUser);
    });
});
```

## Testing Guidelines

1. **Use named parameters**: Always pass parameters as objects
2. **Type safety**: Avoid `any` types, use proper interfaces
3. **Mock external dependencies**: Use Vitest's `vi.fn()` and `vi.mock()`
4. **Clean up**: Use `vi.clearAllMocks()` in `afterEach` hooks
5. **Test structure**: Use `describe` blocks to group related tests

## File Structure

```
packages/test/
├── src/
│   ├── setup.ts            # Global test setup and mocks
│   ├── jest-dom.d.ts       # Type definitions
│   └── index.ts            # Main exports
├── vitest.config.ts        # Vitest configuration
└── package.json
```

## Contributing

When adding new test utilities:

1. Add truly useful utilities that save significant work
2. Avoid wrapping already-simple APIs
3. Export from `src/index.ts`
4. Update this README with usage examples
