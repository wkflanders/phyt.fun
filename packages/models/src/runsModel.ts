import { uuidv7 } from 'uuidv7';

import { InputError } from './errors.js';

import type { UUIDv7, Run, RunUpdate, RunInsert, AvatarUrl } from '@phyt/types';

export interface RunsVO extends Run {
    update({ update }: { update: RunUpdate }): RunsVO;
    remove(): RunsVO;
    with(options: { username?: string; avatarUrl?: AvatarUrl }): RunsVO;
    toDTO<T extends Run = Run>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): Run;
}

export const RunsVO = (() => {
    const make = (run: Run): RunsVO => {
        const update = ({ update }: { update: RunUpdate }): RunsVO => {
            RunsVO.validateUpdate(update);
            return make({
                ...run,
                ...update,
                updatedAt: new Date()
            });
        };

        const remove = (): RunsVO => {
            return make({
                ...run,
                deletedAt: new Date()
            });
        };

        const withOptions = (options: {
            username?: string;
            avatarUrl?: AvatarUrl;
        }): RunsVO => {
            return make({
                ...run,
                ...(options.username !== undefined
                    ? { username: options.username }
                    : {}),
                ...(options.avatarUrl !== undefined
                    ? { avatarUrl: options.avatarUrl }
                    : {})
            });
        };

        const toDTO = <T extends Run = Run>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            return {
                ...run,
                createdAt: new Date(run.createdAt),
                updatedAt: new Date(run.updatedAt),
                ...(run.username ? { username: run.username } : {}),
                ...(run.avatarUrl ? { avatarUrl: run.avatarUrl } : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): Run => ({ ...run });

        return Object.freeze({
            ...toDTO(),
            update,
            remove,
            with: withOptions,
            toDTO,
            toJSON
        }) as RunsVO;
    };

    return {
        create({ input }: { input: RunInsert }): RunsVO {
            RunsVO.validateInput(input);
            return make({
                id: uuidv7() as UUIDv7,
                runnerId: input.runnerId,
                startTime: input.startTime,
                endTime: input.endTime,
                durationSeconds: input.durationSeconds,
                distance: input.distance,
                averagePaceSec: input.averagePaceSec ?? null,
                caloriesBurned: input.caloriesBurned ?? null,
                stepCount: input.stepCount ?? null,
                elevationGain: input.elevationGain ?? null,
                averageHeartRate: input.averageHeartRate ?? null,
                maxHeartRate: input.maxHeartRate ?? null,
                deviceId: input.deviceId ?? null,
                gpsRouteData: input.gpsRouteData ?? null,
                isPosted: input.isPosted ?? false,
                verificationStatus: input.verificationStatus ?? 'pending',
                rawDataJson: input.rawDataJson ?? null,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            });
        },

        from({
            run,
            options
        }: {
            run: Run;
            options?: {
                username?: string;
                avatarUrl?: AvatarUrl;
            };
        }): RunsVO {
            if (!options) {
                return make(run);
            }

            return make({
                ...run,
                ...(options.username !== undefined
                    ? { username: options.username }
                    : {}),
                ...(options.avatarUrl !== undefined
                    ? { avatarUrl: options.avatarUrl }
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

        validateUpdate(update: RunUpdate): void {
            if (update.startTime && !(update.startTime instanceof Date)) {
                throw new InputError('Start time must be a Date');
            }

            if (update.endTime && !(update.endTime instanceof Date)) {
                throw new InputError('End time must be a Date');
            }

            if (update.durationSeconds && update.durationSeconds <= 0) {
                throw new InputError('Duration must be greater than 0');
            }

            if (update.distance && update.distance <= 0) {
                throw new InputError('Distance must be greater than 0');
            }

            if (update.averagePaceSec && update.averagePaceSec <= 0) {
                throw new InputError('Average pace must be greater than 0');
            }

            if (update.caloriesBurned && update.caloriesBurned <= 0) {
                throw new InputError('Calories burned must be greater than 0');
            }

            if (update.stepCount && update.stepCount <= 0) {
                throw new InputError('Step count must be greater than 0');
            }

            if (update.elevationGain && update.elevationGain <= 0) {
                throw new InputError('Elevation gain must be greater than 0');
            }

            if (update.averageHeartRate && update.averageHeartRate <= 0) {
                throw new InputError(
                    'Average heart rate must be greater than 0'
                );
            }

            if (update.maxHeartRate && update.maxHeartRate <= 0) {
                throw new InputError('Max heart rate must be greater than 0');
            }

            if (update.deviceId && update.deviceId.length !== 16) {
                throw new InputError('Device ID must be 16 characters long');
            }

            if (update.gpsRouteData && update.gpsRouteData.length !== 16) {
                throw new InputError(
                    'GPS route data must be 16 characters long'
                );
            }

            if (update.rawDataJson && typeof update.rawDataJson !== 'object') {
                throw new InputError('Raw data JSON must be an object');
            }

            if (update.isPosted && typeof update.isPosted !== 'boolean') {
                throw new InputError('Is posted must be a boolean');
            }

            if (
                update.verificationStatus &&
                update.verificationStatus !== 'pending' &&
                update.verificationStatus !== 'verified'
            ) {
                throw new InputError(
                    'Verification status must be pending or verified'
                );
            }
        }
    };
})();
