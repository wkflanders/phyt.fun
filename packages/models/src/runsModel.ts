import { uuidv7 } from 'uuidv7';

import { InputError } from './errors.js';

import type { UUIDv7, Run, RunUpdate, RunInsert } from '@phyt/types';

export interface RunVO extends Run {
    update(update: RunUpdate): RunVO;
    with(options: { runnerUsername?: string; runnerAvatarUrl?: string }): RunVO;
    toDTO<T extends Run = Run>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): Run;
}

export const RunVO = (() => {
    const make = (
        record: Run & {
            runnerUsername?: string;
            runnerAvatarUrl?: string;
        }
    ): RunVO => {
        const update = (update: RunUpdate): RunVO => {
            RunVO.validateUpdate(update);
            return make({
                ...record,
                ...update,
                updatedAt: new Date()
            });
        };

        const withOptions = (options: {
            runnerUsername?: string;
            runnerAvatarUrl?: string;
        }): RunVO => {
            return make({
                ...record,
                ...(options.runnerUsername !== undefined
                    ? { runnerUsername: options.runnerUsername }
                    : {}),
                ...(options.runnerAvatarUrl !== undefined
                    ? { runnerAvatarUrl: options.runnerAvatarUrl }
                    : {})
            });
        };

        const toDTO = <T extends Run = Run>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            return {
                ...record,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
                ...(record.runnerUsername
                    ? { runnerUsername: record.runnerUsername }
                    : {}),
                ...(record.runnerAvatarUrl !== undefined
                    ? { runnerAvatarUrl: record.runnerAvatarUrl }
                    : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): Run => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            update,
            with: withOptions,
            toDTO,
            toJSON
        }) as RunVO;
    };

    return {
        create(data: RunInsert): RunVO {
            RunVO.validateInput(data);
            return make({
                id: uuidv7() as UUIDv7,
                runnerId: data.runnerId,
                startTime: data.startTime,
                endTime: data.endTime,
                durationSeconds: data.durationSeconds,
                distance: data.distance,
                averagePaceSec: data.averagePaceSec ?? null,
                caloriesBurned: data.caloriesBurned ?? null,
                stepCount: data.stepCount ?? null,
                elevationGain: data.elevationGain ?? null,
                averageHeartRate: data.averageHeartRate ?? null,
                maxHeartRate: data.maxHeartRate ?? null,
                deviceId: data.deviceId ?? null,
                gpsRouteData: data.gpsRouteData ?? null,
                isPosted: false,
                verificationStatus: 'pending',
                rawDataJson: data.rawDataJson ?? null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        },

        from(
            data: Run,
            options?: {
                runnerUsername?: string;
                runnerAvatarUrl?: string;
            }
        ): RunVO {
            if (!options) {
                return make(data);
            }

            return make({
                ...data,
                ...(options.runnerUsername !== undefined
                    ? { runnerUsername: options.runnerUsername }
                    : {}),
                ...(options.runnerAvatarUrl !== undefined
                    ? { runnerAvatarUrl: options.runnerAvatarUrl }
                    : {})
            });
        },

        validateInput(input: RunInsert): void {
            if (!input.runnerId) {
                throw new InputError('Runner ID is required');
            }

            if (input.durationSeconds <= 0) {
                throw new InputError('Duration must be greater than 0');
            }

            if (input.distance <= 0) {
                throw new InputError('Distance must be greater than 0');
            }

            if (input.averagePaceSec && input.averagePaceSec <= 0) {
                throw new InputError('Average pace must be greater than 0');
            }

            if (input.caloriesBurned && input.caloriesBurned <= 0) {
                throw new InputError('Calories burned must be greater than 0');
            }

            if (input.stepCount && input.stepCount <= 0) {
                throw new InputError('Step count must be greater than 0');
            }

            if (input.elevationGain && input.elevationGain <= 0) {
                throw new InputError('Elevation gain must be greater than 0');
            }

            if (input.averageHeartRate && input.averageHeartRate <= 0) {
                throw new InputError(
                    'Average heart rate must be greater than 0'
                );
            }

            if (input.maxHeartRate && input.maxHeartRate <= 0) {
                throw new InputError('Max heart rate must be greater than 0');
            }

            if (input.deviceId && input.deviceId.length !== 16) {
                throw new InputError('Device ID must be 16 characters long');
            }

            if (input.gpsRouteData && input.gpsRouteData.length !== 16) {
                throw new InputError(
                    'GPS route data must be 16 characters long'
                );
            }

            if (input.rawDataJson && typeof input.rawDataJson !== 'object') {
                throw new InputError('Raw data JSON must be an object');
            }

            if (input.isPosted && typeof input.isPosted !== 'boolean') {
                throw new InputError('Is posted must be a boolean');
            }

            if (
                input.verificationStatus &&
                input.verificationStatus !== 'pending' &&
                input.verificationStatus !== 'verified'
            ) {
                throw new InputError(
                    'Verification status must be pending or verified'
                );
            }
        },

        validateUpdate(input: RunUpdate): void {
            if (input.startTime && !(input.startTime instanceof Date)) {
                throw new InputError('Start time must be a Date');
            }

            if (input.endTime && !(input.endTime instanceof Date)) {
                throw new InputError('End time must be a Date');
            }

            if (input.durationSeconds && input.durationSeconds <= 0) {
                throw new InputError('Duration must be greater than 0');
            }

            if (input.distance && input.distance <= 0) {
                throw new InputError('Distance must be greater than 0');
            }

            if (input.averagePaceSec && input.averagePaceSec <= 0) {
                throw new InputError('Average pace must be greater than 0');
            }

            if (input.caloriesBurned && input.caloriesBurned <= 0) {
                throw new InputError('Calories burned must be greater than 0');
            }

            if (input.stepCount && input.stepCount <= 0) {
                throw new InputError('Step count must be greater than 0');
            }

            if (input.elevationGain && input.elevationGain <= 0) {
                throw new InputError('Elevation gain must be greater than 0');
            }

            if (input.averageHeartRate && input.averageHeartRate <= 0) {
                throw new InputError(
                    'Average heart rate must be greater than 0'
                );
            }

            if (input.maxHeartRate && input.maxHeartRate <= 0) {
                throw new InputError('Max heart rate must be greater than 0');
            }

            if (input.deviceId && input.deviceId.length !== 16) {
                throw new InputError('Device ID must be 16 characters long');
            }

            if (input.gpsRouteData && input.gpsRouteData.length !== 16) {
                throw new InputError(
                    'GPS route data must be 16 characters long'
                );
            }

            if (input.rawDataJson && typeof input.rawDataJson !== 'object') {
                throw new InputError('Raw data JSON must be an object');
            }

            if (input.isPosted && typeof input.isPosted !== 'boolean') {
                throw new InputError('Is posted must be a boolean');
            }

            if (
                input.verificationStatus &&
                input.verificationStatus !== 'pending' &&
                input.verificationStatus !== 'verified'
            ) {
                throw new InputError(
                    'Verification status must be pending or verified'
                );
            }
        }
    };
})();
