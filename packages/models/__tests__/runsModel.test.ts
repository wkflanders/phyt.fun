import { uuidv7 } from 'uuidv7';
import { describe, it, expect } from 'vitest';

// eslint-disable-next-line no-restricted-imports
import { RunsVO } from '../src/runsModel.js';

import type { UUIDv7 } from '@phyt/types';

describe('runsModel', () => {
    const validRunInput = {
        runnerId: uuidv7() as UUIDv7,
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T10:30:00Z'),
        durationSeconds: 1800,
        distance: 5000,
        averagePaceSec: 360,
        caloriesBurned: 300,
        stepCount: 6000,
        elevationGain: 100,
        averageHeartRate: 150,
        maxHeartRate: 180,
        deviceId: '1234567890123456',
        gpsRouteData: '9876543210987654',
        isPosted: true,
        verificationStatus: 'verified' as const,
        rawDataJson: { test: 'data' }
    };

    describe('RunsVO.create', () => {
        it('should create a valid run with all fields', () => {
            const run = RunsVO.create({ input: validRunInput });

            expect(run.runnerId).toBe(validRunInput.runnerId);
            expect(run.durationSeconds).toBe(1800);
            expect(run.distance).toBe(5000);
            expect(run.averagePaceSec).toBe(360);
            expect(run.caloriesBurned).toBe(300);
            expect(run.stepCount).toBe(6000);
            expect(run.elevationGain).toBe(100);
            expect(run.averageHeartRate).toBe(150);
            expect(run.maxHeartRate).toBe(180);
            expect(run.deviceId).toBe('1234567890123456');
            expect(run.gpsRouteData).toBe('9876543210987654');
            expect(run.isPosted).toBe(true);
            expect(run.verificationStatus).toBe('verified');
            expect(run.rawDataJson).toEqual({ test: 'data' });
            expect(run.id).toBeDefined();
            expect(run.createdAt).toBeInstanceOf(Date);
            expect(run.updatedAt).toBeInstanceOf(Date);
            expect(run.deletedAt).toBeNull();
        });

        it('should create a run with minimal required fields', () => {
            const minimalInput = {
                runnerId: uuidv7() as UUIDv7,
                startTime: new Date('2024-01-01T10:00:00Z'),
                endTime: new Date('2024-01-01T10:30:00Z'),
                durationSeconds: 1800,
                distance: 5000
            };

            const run = RunsVO.create({ input: minimalInput });

            expect(run.runnerId).toBe(minimalInput.runnerId);
            expect(run.durationSeconds).toBe(1800);
            expect(run.distance).toBe(5000);
            expect(run.averagePaceSec).toBeNull();
            expect(run.caloriesBurned).toBeNull();
            expect(run.stepCount).toBeNull();
            expect(run.elevationGain).toBeNull();
            expect(run.averageHeartRate).toBeNull();
            expect(run.maxHeartRate).toBeNull();
            expect(run.deviceId).toBeNull();
            expect(run.gpsRouteData).toBeNull();
            expect(run.isPosted).toBe(false);
            expect(run.verificationStatus).toBe('pending');
            expect(run.rawDataJson).toBeNull();
        });

        it('should reject run without runner ID', () => {
            const invalidInput = { ...validRunInput, runnerId: '' as UUIDv7 };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Runner ID is required');
        });

        it('should reject run with zero duration', () => {
            const invalidInput = { ...validRunInput, durationSeconds: 0 };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Duration must be greater than 0');
        });

        it('should reject run with negative duration', () => {
            const invalidInput = { ...validRunInput, durationSeconds: -100 };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Duration must be greater than 0');
        });

        it('should reject run with zero distance', () => {
            const invalidInput = { ...validRunInput, distance: 0 };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Distance must be greater than 0');
        });

        it('should reject run with negative distance', () => {
            const invalidInput = { ...validRunInput, distance: -1000 };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Distance must be greater than 0');
        });

        it('should reject run with invalid average pace', () => {
            const invalidInput = { ...validRunInput, averagePaceSec: -10 };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Average pace must be greater than 0');
        });

        it('should reject run with invalid calories burned', () => {
            const invalidInput = { ...validRunInput, caloriesBurned: -50 };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Calories burned must be greater than 0');
        });

        it('should reject run with invalid step count', () => {
            const invalidInput = { ...validRunInput, stepCount: -100 };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Step count must be greater than 0');
        });

        it('should reject run with invalid elevation gain', () => {
            const invalidInput = { ...validRunInput, elevationGain: -10 };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Elevation gain must be greater than 0');
        });

        it('should reject run with invalid average heart rate', () => {
            const invalidInput = { ...validRunInput, averageHeartRate: -5 };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Average heart rate must be greater than 0');
        });

        it('should reject run with invalid max heart rate', () => {
            const invalidInput = { ...validRunInput, maxHeartRate: 0 };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Max heart rate must be greater than 0');
        });

        it('should reject run with invalid device ID length', () => {
            const invalidInput = { ...validRunInput, deviceId: 'short' };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Device ID must be 16 characters long');
        });

        it('should reject run with invalid GPS route data length', () => {
            const invalidInput = { ...validRunInput, gpsRouteData: 'short' };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('GPS route data must be 16 characters long');
        });

        it('should reject run with invalid raw data JSON', () => {
            const invalidInput = {
                ...validRunInput,
                rawDataJson: 'not an object' as unknown as Record<
                    string,
                    unknown
                >
            };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Raw data JSON must be an object');
        });

        it('should reject run with invalid verification status', () => {
            const invalidInput = {
                ...validRunInput,
                verificationStatus: 'flagged' as const
            };

            expect(() => {
                RunsVO.create({ input: invalidInput });
            }).toThrow('Verification status must be pending or verified');
        });
    });

    describe('RunsVO.update', () => {
        it('should update run data successfully', () => {
            const run = RunsVO.create({ input: validRunInput });
            const updatedRun = run.update({
                update: {
                    distance: 6000,
                    durationSeconds: 2000,
                    verificationStatus: 'pending'
                }
            });

            expect(updatedRun.distance).toBe(6000);
            expect(updatedRun.durationSeconds).toBe(2000);
            expect(updatedRun.verificationStatus).toBe('pending');
            expect(updatedRun.runnerId).toBe(validRunInput.runnerId); // should preserve other fields
            expect(updatedRun.updatedAt).toBeInstanceOf(Date);
        });

        it('should reject invalid update data', () => {
            const run = RunsVO.create({ input: validRunInput });

            expect(() => {
                run.update({
                    update: { distance: -1000 }
                });
            }).toThrow('Distance must be greater than 0');
        });

        it('should reject invalid start time type', () => {
            const run = RunsVO.create({ input: validRunInput });

            expect(() => {
                run.update({
                    update: { startTime: 'invalid date' as unknown as Date }
                });
            }).toThrow('Start time must be a Date');
        });

        it('should reject invalid end time type', () => {
            const run = RunsVO.create({ input: validRunInput });

            expect(() => {
                run.update({
                    update: { endTime: 'invalid date' as unknown as Date }
                });
            }).toThrow('End time must be a Date');
        });
    });

    describe('RunsVO.remove', () => {
        it('should mark run as deleted', () => {
            const run = RunsVO.create({ input: validRunInput });
            const deletedRun = run.remove();

            expect(deletedRun.deletedAt).toBeInstanceOf(Date);
            expect(deletedRun.id).toBe(run.id); // should preserve other fields
        });
    });

    describe('RunsVO.with', () => {
        it('should add username and avatar URL', () => {
            const run = RunsVO.create({ input: validRunInput });
            const runWithOptions = run.with({
                username: 'testuser',
                avatarUrl: 'https://example.com/avatar.jpg'
            });

            expect(runWithOptions.username).toBe('testuser');
            expect(runWithOptions.avatarUrl).toBe(
                'https://example.com/avatar.jpg'
            );
            expect(runWithOptions.id).toBe(run.id); // should preserve other fields
        });

        it('should handle partial options', () => {
            const run = RunsVO.create({ input: validRunInput });
            const runWithUsername = run.with({ username: 'testuser' });

            expect(runWithUsername.username).toBe('testuser');
            expect(runWithUsername.avatarUrl).toBeUndefined();
        });
    });

    describe('RunsVO.from', () => {
        it('should create RunsVO from existing run data', () => {
            const existingRun = RunsVO.create({ input: validRunInput });
            const runFromData = RunsVO.from({ run: existingRun.toJSON() });

            expect(runFromData.id).toBe(existingRun.id);
            expect(runFromData.runnerId).toBe(existingRun.runnerId);
            expect(runFromData.distance).toBe(existingRun.distance);
        });

        it('should create RunsVO from existing run data with options', () => {
            const existingRun = RunsVO.create({ input: validRunInput });
            const runFromData = RunsVO.from({
                run: existingRun.toJSON(),
                options: {
                    username: 'fromuser',
                    avatarUrl: 'https://example.com/from-avatar.jpg'
                }
            });

            expect(runFromData.username).toBe('fromuser');
            expect(runFromData.avatarUrl).toBe(
                'https://example.com/from-avatar.jpg'
            );
        });
    });

    describe('RunsVO.toDTO', () => {
        it('should return DTO with proper date instances', () => {
            const run = RunsVO.create({ input: validRunInput });
            const dto = run.toDTO();

            expect(dto.createdAt).toBeInstanceOf(Date);
            expect(dto.updatedAt).toBeInstanceOf(Date);
            expect(dto.id).toBe(run.id);
        });

        it('should merge additional options into DTO', () => {
            const run = RunsVO.create({ input: validRunInput });
            const dto = run.toDTO();

            expect(dto.id).toBe(run.id);
            expect(dto.runnerId).toBe(run.runnerId);
        });
    });

    describe('RunsVO.toJSON', () => {
        it('should return plain object representation', () => {
            const run = RunsVO.create({ input: validRunInput });
            const json = run.toJSON();

            expect(json).toEqual(
                expect.objectContaining({
                    runnerId: validRunInput.runnerId,
                    distance: validRunInput.distance,
                    durationSeconds: validRunInput.durationSeconds
                })
            );

            // Should be a plain object without VO methods
            expect(json).not.toHaveProperty('update');
            expect(json).not.toHaveProperty('remove');
        });
    });
});
