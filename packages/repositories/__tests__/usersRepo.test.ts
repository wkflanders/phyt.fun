import { makeUsersRepository } from '@phyt/repositories';

import { createMockUsersDrizzleOps, createMockAwsOps } from '@phyt/test';

import { describe, it, expect } from 'vitest';

describe('usersRepo', () => {
    it('should create a repository instance', () => {
        const mockDrizzleOps = createMockUsersDrizzleOps();
        const mockAwsOps = createMockAwsOps();

        const repo = makeUsersRepository({
            drizzleOps: mockDrizzleOps,
            awsOps: mockAwsOps
        });

        expect(repo).toBeDefined();
        expect(typeof repo.save).toBe('function');
        expect(typeof repo.findById).toBe('function');
        expect(typeof repo.findByPrivyId).toBe('function');
        expect(typeof repo.uploadAvatar).toBe('function');
        expect(typeof repo.remove).toBe('function');
    });
});
