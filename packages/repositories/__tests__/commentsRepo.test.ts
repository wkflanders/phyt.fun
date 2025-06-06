import { makeCommentsRepository } from '@phyt/repositories';

import { createMockCommentsDrizzleOps } from '@phyt/test';

import { describe, it, expect } from 'vitest';

describe('commentsRepo', () => {
    it('should create a repository instance', () => {
        const mockDrizzleOps = createMockCommentsDrizzleOps();

        const repo = makeCommentsRepository({
            drizzleOps: mockDrizzleOps
        });

        expect(repo).toBeDefined();
        expect(typeof repo.save).toBe('function');
        expect(typeof repo.findById).toBe('function');
        expect(typeof repo.findByPost).toBe('function');
        expect(typeof repo.findReplies).toBe('function');
        expect(typeof repo.remove).toBe('function');
    });
});
