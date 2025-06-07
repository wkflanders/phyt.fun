import { UserSchema, CreateUserSchema, EmailSchema } from '@phyt/dto';

import { describe, it, expect } from 'vitest';

describe('usersDTO', () => {
    describe('UserSchema', () => {
        it('should validate a valid user object', () => {
            const validUser = {
                id: '019743ff-72cf-723c-a1bf-fa669ae6547d' as const,
                email: 'test@example.com',
                username: 'testuser',
                role: 'user' as const,
                privyId: 'privy-123',
                avatarUrl: 'https://example.com/avatar.jpg',
                walletAddress: '0x1234567890123456789012345678901234567890',
                phytnessPoints: 100,
                twitterHandle: '@testuser',
                stravaHandle: 'strava-handle',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            };

            const result = UserSchema.safeParse(validUser);
            expect(result.success).toBe(true);
        });

        it('should reject invalid email', () => {
            const invalidUser = {
                id: '019743ff-72cf-723c-a1bf-fa669ae6547d' as const,
                email: 'invalid-email',
                username: 'testuser',
                role: 'user' as const,
                privyId: 'privy-123',
                avatarUrl: 'https://example.com/avatar.jpg',
                walletAddress: '0x1234567890123456789012345678901234567890',
                phytnessPoints: 100,
                twitterHandle: '@testuser',
                stravaHandle: 'strava-handle',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            };

            const result = UserSchema.safeParse(invalidUser);
            expect(result.success).toBe(false);
        });
    });

    describe('CreateUserSchema', () => {
        it('should validate a valid create user request', () => {
            const validCreateUser = {
                email: 'test@example.com',
                username: 'testuser',
                privyId: 'privy-123',
                walletAddress: '0x1234567890123456789012345678901234567890'
            };

            const result = CreateUserSchema.safeParse(validCreateUser);
            expect(result.success).toBe(true);
        });

        it('should reject username that is too short', () => {
            const invalidCreateUser = {
                email: 'test@example.com',
                username: 'ab',
                privyId: 'privy-123',
                walletAddress: '0x123'
            };

            const result = CreateUserSchema.safeParse(invalidCreateUser);
            expect(result.success).toBe(false);
        });
    });

    describe('EmailSchema', () => {
        it('should validate a valid email', () => {
            const validEmail = { email: 'test@example.com' };

            const result = EmailSchema.safeParse(validEmail);
            expect(result.success).toBe(true);
        });

        it('should reject invalid email format', () => {
            const invalidEmail = { email: 'not-an-email' };

            const result = EmailSchema.safeParse(invalidEmail);
            expect(result.success).toBe(false);
        });
    });
});
