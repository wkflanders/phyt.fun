/* eslint-disable no-console */
import { describe, it, expect, beforeEach } from 'vitest';

// eslint-disable-next-line no-restricted-imports
import { UsersVO } from '../usersModel.js';

describe('🧪 UsersModel [UNIT TESTS]', () => {
    beforeEach(() => {
        console.log('Setting up UsersModel test environment...');
    });

    describe('User Creation (UsersVO.create)', () => {
        describe('Valid User Creation', () => {
            it('should successfully create user with all required fields [CREATION]', () => {
                console.log('Test: Creating user with valid input data');

                const userInput = {
                    email: 'test@example.com',
                    username: 'testuser',
                    privyId: 'privy-123',
                    walletAddress: '0x1234567890123456789012345678901234567890'
                };

                try {
                    const user = UsersVO.create({ input: userInput });

                    console.log(
                        '✅ User created successfully, validating properties...'
                    );
                    expect(user.email).toBe('test@example.com');
                    expect(user.username).toBe('testuser');
                    expect(user.privyId).toBe('privy-123');
                    expect(user.walletAddress).toBe(
                        '0x1234567890123456789012345678901234567890'
                    );

                    console.log(
                        '✅ All user properties validated successfully'
                    );
                } catch (error) {
                    console.error('❌ User creation failed unexpectedly!');
                    console.error('❌ Input data:', userInput);
                    console.error('❌ Error details:', error);
                    throw error;
                }
            });
        });

        describe('Input Validation Errors', () => {
            it('should REJECT user creation when email format is invalid [VALIDATION]', () => {
                console.log('Test: Validating email format rejection');

                const invalidUserInput = {
                    email: 'invalid-email', // Missing @ symbol
                    username: 'testuser',
                    privyId: 'privy-123',
                    walletAddress: '0x1234567890123456789012345678901234567890'
                };

                console.log(
                    'Attempting to create user with invalid email:',
                    invalidUserInput.email
                );

                expect(() => {
                    UsersVO.create({ input: invalidUserInput });
                }).toThrow('Valid email is required');

                console.log('✅ Email validation worked correctly');
            });

            it('should REJECT user creation when username is empty [VALIDATION]', () => {
                console.log('Test: Validating empty username rejection');

                const invalidUserInput = {
                    email: 'test@example.com',
                    username: '', // Empty username
                    privyId: 'privy-123',
                    walletAddress: '0x1234567890123456789012345678901234567890'
                };

                console.log('Attempting to create user with empty username');

                expect(() => {
                    UsersVO.create({ input: invalidUserInput });
                }).toThrow('Username cannot be empty');

                console.log('✅ Username validation worked correctly');
            });
        });
    });

    describe('User Updates (UsersVO.update)', () => {
        describe('Valid Updates', () => {
            it('should successfully update username while preserving other fields [UPDATE]', () => {
                console.log(
                    'Test: Updating user username and preserving other data'
                );

                const userInput = {
                    email: 'test@example.com',
                    username: 'testuser',
                    privyId: 'privy-123',
                    walletAddress: '0x1234567890123456789012345678901234567890'
                };

                try {
                    console.log('Creating initial user...');
                    const user = UsersVO.create({ input: userInput });

                    console.log('Updating username...');
                    const updatedUser = user.update({
                        update: { username: 'newusername' }
                    });

                    console.log('Validating update results...');
                    expect(updatedUser.username).toBe('newusername');
                    expect(updatedUser.email).toBe('test@example.com'); // should preserve other fields

                    console.log('✅ User update completed successfully');
                } catch (error) {
                    console.error('❌ User update failed!');
                    console.error('❌ Original input:', userInput);
                    console.error(
                        '❌ Update data: { username: "newusername" }'
                    );
                    console.error('❌ Error details:', error);
                    throw error;
                }
            });
        });

        describe('Update Validation Errors', () => {
            it('should REJECT invalid Twitter handle format (with @ symbol) [VALIDATION]', () => {
                console.log('Test: Validating Twitter handle format rejection');

                const userInput = {
                    email: 'test@example.com',
                    username: 'testuser',
                    privyId: 'privy-123',
                    walletAddress: '0x1234567890123456789012345678901234567890'
                };

                try {
                    console.log('Creating user for update test...');
                    const user = UsersVO.create({ input: userInput });

                    console.log(
                        'Attempting to set invalid Twitter handle: @invalidhandle'
                    );

                    expect(() => {
                        user.update({
                            update: { twitterHandle: '@invalidhandle' }
                        });
                    }).toThrow('Twitter handle should not include @ symbol');

                    console.log(
                        '✅ Twitter handle validation worked correctly'
                    );
                } catch (error) {
                    if (
                        error instanceof Error &&
                        error.message.includes(
                            'Twitter handle should not include @ symbol'
                        )
                    ) {
                        throw error; // Expected validation error
                    }

                    console.error(
                        '❌ Unexpected error during Twitter handle validation!'
                    );
                    console.error('❌ User input:', userInput);
                    console.error(
                        '❌ Update data: { twitterHandle: "@invalidhandle" }'
                    );
                    console.error('❌ Error details:', error);
                    throw error;
                }
            });
        });
    });

    describe('🧪 Debug Tests (Stack Overflow Investigation)', () => {
        it('should create user object without accessing properties [DEBUG]', () => {
            console.log('Debug Test: Creating user without property access');

            const userInput = {
                email: 'test@example.com',
                username: 'testuser',
                privyId: 'privy-123',
                walletAddress: '0x1234567890123456789012345678901234567890'
            };

            try {
                console.log('Creating user object (no property access)...');
                const user = UsersVO.create({ input: userInput });

                // Don't access any properties, just check it exists
                expect(user).toBeDefined();

                console.log(
                    '✅ User object created successfully without stack overflow'
                );
            } catch (error) {
                console.error('❌ Stack overflow or creation error occurred!');
                console.error('❌ Input data:', userInput);
                console.error('❌ Error details:', error);
                throw error;
            }
        });
    });
});
