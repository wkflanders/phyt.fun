import { describe, it, expect, vi } from 'vitest';

// eslint-disable-next-line no-restricted-imports
import {
    createMockUser,
    createMockRequest,
    createMockResponse
} from '../src/mocks.js';

describe('@phyt/test utilities', () => {
    describe('createMockUser', () => {
        it('should return user with expected properties', () => {
            const user = createMockUser();

            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('createdAt');
            expect(user).toHaveProperty('updatedAt');
        });

        it('should return consistent data', () => {
            const user1 = createMockUser();
            const user2 = createMockUser();

            expect(user1.id).toBe(user2.id);
            expect(user1.email).toBe(user2.email);
            expect(user1.username).toBe(user2.username);
        });

        it('should have valid email format', () => {
            const user = createMockUser();
            expect(user.email).toMatch(/.*@.*\..*/);
            expect(user.email).toBe('test@example.com');
        });

        it('should have Date objects for timestamps', () => {
            const user = createMockUser();
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe('createMockRequest', () => {
        it('should return request with default properties', () => {
            const req = createMockRequest();

            expect(req).toHaveProperty('body');
            expect(req).toHaveProperty('params');
            expect(req).toHaveProperty('query');
            expect(req).toHaveProperty('headers');

            expect(req.body).toEqual({});
            expect(req.params).toEqual({});
            expect(req.query).toEqual({});
            expect(req.headers).toEqual({});
        });

        it('should merge overrides with defaults', () => {
            const overrides = {
                body: { userId: '123' },
                params: { id: 'test-id' }
            };

            const req = createMockRequest(overrides);

            expect(req.body).toEqual({ userId: '123' });
            expect(req.params).toEqual({ id: 'test-id' });
            expect(req.query).toEqual({});
            expect(req.headers).toEqual({});
        });

        it('should not mutate the overrides object', () => {
            const overrides = { body: { test: 'value' } };
            const originalOverrides = { ...overrides };

            createMockRequest(overrides);

            expect(overrides).toEqual(originalOverrides);
        });
    });

    describe('createMockResponse', () => {
        it('should return response with expected method properties', () => {
            const res = createMockResponse();

            expect(res).toHaveProperty('status');
            expect(res).toHaveProperty('json');
            expect(res).toHaveProperty('send');
            expect(res).toHaveProperty('end');
        });

        it('should create independent response objects', () => {
            const res1 = createMockResponse();
            const res2 = createMockResponse();

            expect(res1).not.toBe(res2);
        });
    });

    describe('global setup', () => {
        it('should have global fetch mock available', () => {
            expect(globalThis.fetch).toBeDefined();
        });

        it('should have crypto API available', () => {
            expect(globalThis.crypto).toBeDefined();
            expect(typeof globalThis.crypto.randomUUID).toBe('function');
            expect(typeof globalThis.crypto.getRandomValues).toBe('function');
        });

        // it('should have NODE_ENV set to test', () => {
        //     expect(process.env.NODE_ENV).toBe('test');
        // });
    });

    describe('exports', () => {
        it('should export vitest utilities', () => {
            // These imports work because they are re-exported from vitest
            expect(describe).toBeDefined();
            expect(it).toBeDefined();
            expect(expect).toBeDefined();
            expect(vi).toBeDefined();
        });
    });
});
