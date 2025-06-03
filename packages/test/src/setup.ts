import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Set environment variables using vitest's stubEnv
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('TZ', 'UTC');

// Global mocks for common browser APIs that might be needed in Node environment
Object.defineProperty(globalThis, 'crypto', {
    value: {
        randomUUID: vi.fn(
            () => 'test-uuid-' + Math.random().toString(36).substring(2, 15)
        ),
        getRandomValues: vi.fn((arr: ArrayBufferView) => {
            // Mock implementation that fills the array with random values
            const uint8Array = new Uint8Array(
                arr.buffer,
                arr.byteOffset,
                arr.byteLength
            );
            for (let i = 0; i < uint8Array.length; i++) {
                uint8Array[i] = Math.floor(Math.random() * 256);
            }
            return arr;
        })
    }
});

Object.defineProperty(globalThis, 'fetch', {
    value: vi.fn(),
    writable: true
});

// Mock common infrastructure packages to avoid dependency issues in unit tests
vi.mock('@phyt/infra', () => ({
    // Add common mocks for infrastructure services
    awsClient: vi.fn(),
    privyClient: vi.fn(),
    viemClient: vi.fn()
}));

vi.mock('@phyt/aws', () => ({
    // Add common mocks for AWS services
    uploadImage: vi.fn(),
    uploadMetadata: vi.fn(),
    generatePresignedUrl: vi.fn()
}));

// Global test utilities
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
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        end: vi.fn().mockReturnThis()
    };
    return res;
};
