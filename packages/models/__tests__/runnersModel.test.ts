import { uuidv7 } from 'uuidv7';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// eslint-disable-next-line no-restricted-imports
import { RunnerVO } from '../src/runnersModel.js';

import type { UUIDv7 } from '@phyt/types';

describe('runnersModel', () => {
    const validRunnerInput = {
        userId: uuidv7() as UUIDv7,
        totalDistance: 10000,
        averagePace: 360,
        totalRuns: 5,
        bestMileTime: 300,
        status: 'active' as const,
        isPooled: false,
        runnerWallet: '0x1234567890123456789012345678901234567890' as const
    };

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('RunnerVO.create', () => {
        it('should create a valid runner with all fields', () => {
            const runner = RunnerVO.create({ input: validRunnerInput });

            expect(runner.userId).toBe(validRunnerInput.userId);
            expect(runner.totalDistance).toBe(10000);
            expect(runner.averagePace).toBe(360);
            expect(runner.totalRuns).toBe(5);
            expect(runner.bestMileTime).toBe(300);
            expect(runner.status).toBe('active');
            expect(runner.isPooled).toBe(false);
            expect(runner.runnerWallet).toBe(
                '0x1234567890123456789012345678901234567890'
            );
            expect(runner.id).toBeDefined();
            expect(runner.createdAt).toBeInstanceOf(Date);
            expect(runner.updatedAt).toBeInstanceOf(Date);
            expect(runner.deletedAt).toBeNull();
        });

        it('should reject runner without user ID', () => {
            const invalidInput = { ...validRunnerInput, userId: '' as UUIDv7 };

            expect(() => {
                RunnerVO.create({ input: invalidInput });
            }).toThrow('User ID is required');
        });

        it('should reject runner with negative total distance', () => {
            const invalidInput = { ...validRunnerInput, totalDistance: -1000 };

            expect(() => {
                RunnerVO.create({ input: invalidInput });
            }).toThrow('Total distance cannot be negative');
        });

        it('should reject runner with negative average pace', () => {
            const invalidInput = { ...validRunnerInput, averagePace: -60 };

            expect(() => {
                RunnerVO.create({ input: invalidInput });
            }).toThrow('Average pace cannot be negative');
        });

        it('should reject runner with negative best mile time', () => {
            const invalidInput = { ...validRunnerInput, bestMileTime: -120 };

            expect(() => {
                RunnerVO.create({ input: invalidInput });
            }).toThrow('Best mile time cannot be negative');
        });

        it('should reject runner with negative total runs', () => {
            const invalidInput = { ...validRunnerInput, totalRuns: -1 };

            expect(() => {
                RunnerVO.create({ input: invalidInput });
            }).toThrow('Total runs cannot be negative');
        });

        it('should accept runner with zero values for optional fields', () => {
            const inputWithZeros = {
                ...validRunnerInput,
                totalDistance: 0,
                averagePace: 0,
                totalRuns: 0,
                bestMileTime: 0
            };

            const runner = RunnerVO.create({ input: inputWithZeros });

            expect(runner.totalDistance).toBe(0);
            expect(runner.averagePace).toBe(0);
            expect(runner.totalRuns).toBe(0);
            expect(runner.bestMileTime).toBe(0);
        });
    });

    describe('RunnerVO.update', () => {
        it('should update runner data successfully', () => {
            const runner = RunnerVO.create({ input: validRunnerInput });

            vi.advanceTimersByTime(1000);

            const updatedRunner = runner.update({
                update: {
                    totalDistance: 15000,
                    totalRuns: 8,
                    bestMileTime: 280,
                    status: 'inactive'
                }
            });

            expect(updatedRunner.totalDistance).toBe(15000);
            expect(updatedRunner.totalRuns).toBe(8);
            expect(updatedRunner.bestMileTime).toBe(280);
            expect(updatedRunner.status).toBe('inactive');
            expect(updatedRunner.userId).toBe(validRunnerInput.userId); // should preserve other fields
            expect(updatedRunner.updatedAt).toBeInstanceOf(Date);
            expect(updatedRunner.updatedAt > runner.updatedAt).toBe(true);
        });

        it('should reject update with negative total distance', () => {
            const runner = RunnerVO.create({ input: validRunnerInput });

            expect(() => {
                runner.update({ update: { totalDistance: -500 } });
            }).toThrow('Total distance cannot be negative');
        });

        it('should reject update with negative average pace', () => {
            const runner = RunnerVO.create({ input: validRunnerInput });

            expect(() => {
                runner.update({ update: { averagePace: -30 } });
            }).toThrow('Average pace cannot be negative');
        });

        it('should reject update with negative best mile time', () => {
            const runner = RunnerVO.create({ input: validRunnerInput });

            expect(() => {
                runner.update({ update: { bestMileTime: -100 } });
            }).toThrow('Best mile time cannot be negative');
        });

        it('should reject update with negative total runs', () => {
            const runner = RunnerVO.create({ input: validRunnerInput });

            expect(() => {
                runner.update({ update: { totalRuns: -2 } });
            }).toThrow('Total runs cannot be negative');
        });
    });

    describe('RunnerVO.remove', () => {
        it('should mark runner as deleted', () => {
            const runner = RunnerVO.create({ input: validRunnerInput });
            const deletedRunner = runner.remove();

            expect(deletedRunner.deletedAt).toBeInstanceOf(Date);
            expect(deletedRunner.id).toBe(runner.id); // should preserve other fields
            expect(deletedRunner.userId).toBe(runner.userId);
        });
    });

    describe('RunnerVO.with', () => {
        it('should add username and avatar URL', () => {
            const runner = RunnerVO.create({ input: validRunnerInput });
            const runnerWithOptions = runner.with({
                username: 'testrunner',
                avatarUrl: 'https://example.com/avatar.jpg'
            });

            expect(runnerWithOptions.username).toBe('testrunner');
            expect(runnerWithOptions.avatarUrl).toBe(
                'https://example.com/avatar.jpg'
            );
            expect(runnerWithOptions.id).toBe(runner.id); // should preserve other fields
        });

        it('should handle partial options', () => {
            const runner = RunnerVO.create({ input: validRunnerInput });
            const runnerWithUsername = runner.with({ username: 'testrunner' });

            expect(runnerWithUsername.username).toBe('testrunner');
            expect(runnerWithUsername.avatarUrl).toBeUndefined();
        });
    });

    describe('RunnerVO.from', () => {
        it('should create RunnerVO from existing runner data', () => {
            const existingRunner = RunnerVO.create({ input: validRunnerInput });
            const runnerFromData = RunnerVO.from({
                runner: existingRunner.toJSON()
            });

            expect(runnerFromData.id).toBe(existingRunner.id);
            expect(runnerFromData.totalDistance).toBe(
                existingRunner.totalDistance
            );
            expect(runnerFromData.userId).toBe(existingRunner.userId);
        });

        it('should create RunnerVO from existing runner data with options', () => {
            const existingRunner = RunnerVO.create({ input: validRunnerInput });

            const runnerFromData = RunnerVO.from({
                runner: existingRunner.toJSON(),
                options: {
                    username: 'fromrunner',
                    avatarUrl: 'https://example.com/from-avatar.jpg'
                }
            });

            expect(runnerFromData.username).toBe('fromrunner');
            expect(runnerFromData.avatarUrl).toBe(
                'https://example.com/from-avatar.jpg'
            );
        });
    });

    describe('RunnerVO.toDTO', () => {
        it('should return DTO with proper date instances', () => {
            const runner = RunnerVO.create({ input: validRunnerInput });
            const dto = runner.toDTO();

            expect(dto.createdAt).toBeInstanceOf(Date);
            expect(dto.updatedAt).toBeInstanceOf(Date);
            expect(dto.id).toBe(runner.id);
            expect(dto.totalDistance).toBe(runner.totalDistance);
        });

        it('should include username and avatarUrl in DTO when present', () => {
            const runner = RunnerVO.create({ input: validRunnerInput });
            const runnerWithOptions = runner.with({
                username: 'testrunner',
                avatarUrl: 'https://example.com/avatar.jpg'
            });
            const dto = runnerWithOptions.toDTO();

            expect(dto.username).toBe('testrunner');
            expect(dto.avatarUrl).toBe('https://example.com/avatar.jpg');
        });
    });

    describe('RunnerVO.toJSON', () => {
        it('should return plain object representation', () => {
            const runner = RunnerVO.create({ input: validRunnerInput });
            const json = runner.toJSON();

            expect(json).toEqual(
                expect.objectContaining({
                    userId: validRunnerInput.userId,
                    totalDistance: validRunnerInput.totalDistance,
                    averagePace: validRunnerInput.averagePace,
                    totalRuns: validRunnerInput.totalRuns,
                    status: validRunnerInput.status
                })
            );

            // Should be a plain object without VO methods
            expect(json).not.toHaveProperty('update');
            expect(json).not.toHaveProperty('remove');
        });
    });
});
