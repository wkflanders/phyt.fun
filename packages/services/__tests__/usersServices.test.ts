import { makeUsersService } from '@phyt/services';

import { createMockUsersRepo } from '@phyt/test';

import { describe, it, expect } from 'vitest';

describe('usersServices', () => {
    it('should create a service instance', () => {
        const mockUsersRepo = createMockUsersRepo();

        const service = makeUsersService({ usersRepo: mockUsersRepo });

        expect(service).toBeDefined();
        expect(typeof service.createUser).toBe('function');
        expect(typeof service.getUserById).toBe('function');
        expect(typeof service.updateUser).toBe('function');
        expect(typeof service.listUsers).toBe('function');
        expect(typeof service.deleteUser).toBe('function');
    });
});
