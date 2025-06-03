// Test utilities - directly defined to avoid import issues
export const createMockUser = () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
});

export const createMockRequest = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides
});

export const createMockResponse = () => {
    const vi = () => ({ fn: () => ({ mockReturnThis: () => ({}) }) });
    const res = {
        status: vi().fn().mockReturnThis(),
        json: vi().fn().mockReturnThis(),
        send: vi().fn().mockReturnThis(),
        end: vi().fn().mockReturnThis()
    };
    return res;
};

// Re-export vitest utilities for convenience
export {
    vi,
    describe,
    it,
    expect,
    beforeEach,
    afterEach,
    beforeAll,
    afterAll
} from 'vitest';

// Re-export testing library utilities
export * from '@testing-library/dom';
