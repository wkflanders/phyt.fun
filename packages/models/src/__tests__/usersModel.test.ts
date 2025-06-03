import { describe, it, expect } from 'vitest';

// eslint-disable-next-line no-restricted-imports
import { UsersVO } from '../usersModel.js';

describe('UsersModel', () => {
    describe('User Creation (UsersVO.create)', () => {
        describe('Valid User Creation', () => {
            it('should successfully create user with all required fields', () => {
                const userInput = {
                    email: 'test@example.com',
                    username: 'testuser',
                    privyId: 'privy-123',
                    walletAddress: '0x1234567890123456789012345678901234567890'
                };

                const user = UsersVO.create({ input: userInput });

                expect(user.email).toBe('test@example.com');
                expect(user.username).toBe('testuser');
                expect(user.privyId).toBe('privy-123');
                expect(user.walletAddress).toBe(
                    '0x1234567890123456789012345678901234567890'
                );
            });
        });

        describe('Input Validation Errors', () => {
            it('should REJECT user creation when email format is invalid', () => {
                const invalidUserInput = {
                    email: 'invalid-email', // Missing @ symbol
                    username: 'testuser',
                    privyId: 'privy-123',
                    walletAddress: '0x1234567890123456789012345678901234567890'
                };

                expect(() => {
                    UsersVO.create({ input: invalidUserInput });
                }).toThrow('Valid email is required');
            });

            it('should REJECT user creation when username is empty', () => {
                const invalidUserInput = {
                    email: 'test@example.com',
                    username: '', // Empty username
                    privyId: 'privy-123',
                    walletAddress: '0x1234567890123456789012345678901234567890'
                };

                expect(() => {
                    UsersVO.create({ input: invalidUserInput });
                }).toThrow('Username cannot be empty');
            });
        });
    });

    describe('User Updates (UsersVO.update)', () => {
        describe('Valid Updates', () => {
            it('should successfully update username while preserving other fields', () => {
                const userInput = {
                    email: 'test@example.com',
                    username: 'testuser',
                    privyId: 'privy-123',
                    walletAddress: '0x1234567890123456789012345678901234567890'
                };

                const user = UsersVO.create({ input: userInput });
                const updatedUser = user.update({
                    update: { username: 'newusername' }
                });

                expect(updatedUser.username).toBe('newusername');
                expect(updatedUser.email).toBe('test@example.com'); // should preserve other fields
            });
        });

        describe('Update Validation Errors', () => {
            it('should REJECT invalid Twitter handle format (with @ symbol)', () => {
                const userInput = {
                    email: 'test@example.com',
                    username: 'testuser',
                    privyId: 'privy-123',
                    walletAddress: '0x1234567890123456789012345678901234567890'
                };

                const user = UsersVO.create({ input: userInput });

                expect(() => {
                    user.update({
                        update: { twitterHandle: '@invalidhandle' }
                    });
                }).toThrow('Twitter handle should not include @ symbol');
            });
        });
    });

    describe('Debug Tests', () => {
        it('should create user object without accessing properties', () => {
            const userInput = {
                email: 'test@example.com',
                username: 'testuser',
                privyId: 'privy-123',
                walletAddress: '0x1234567890123456789012345678901234567890'
            };

            const user = UsersVO.create({ input: userInput });

            // Don't access any properties, just check it exists
            expect(user).toBeDefined();
        });
    });
});
