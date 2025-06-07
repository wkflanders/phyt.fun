import { randomUUID } from 'node:crypto';

import { vi } from 'vitest';

// freeze test clock if you like
// vi.useFakeTimers().setSystemTime(new Date('2025-01-01'));

// example global mock
vi.mock('uuid', () => ({
    v4: () => randomUUID().replace(/-.*/, '') // deterministic-ish stub
}));
