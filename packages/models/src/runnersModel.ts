import { uuidv7 } from 'uuidv7';

import { InputError } from './errors.js';

import type { UUIDv7, Runner, RunnerInsert, RunnerUpdate } from '@phyt/types';

export interface RunnerVO extends Runner {
    update(update: RunnerUpdate): RunnerVO;
    with(options: { username?: string; avatarUrl?: string }): RunnerVO;
    toDTO<T extends Runner = Runner>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): Runner;
}

export const RunnerVO = (() => {
    const make = (
        record: Runner & {
            username?: string | null;
            avatarUrl?: string | null;
        }
    ): RunnerVO => {
        const update = (updateData: RunnerUpdate): RunnerVO => {
            RunnerVO.validateUpdate(updateData);
            return make({
                ...record,
                ...updateData,
                updatedAt: new Date()
            });
        };

        const withOptions = (options: {
            username?: string;
            avatarUrl?: string;
        }): RunnerVO => {
            return make({
                ...record,
                ...(options.username !== undefined
                    ? { username: options.username }
                    : {}),
                ...(options.avatarUrl !== undefined
                    ? { avatarUrl: options.avatarUrl }
                    : {})
            });
        };

        const toDTO = <T extends Runner = Runner>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            return {
                ...record,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
                ...(record.username ? { username: record.username } : {}),
                ...(record.avatarUrl ? { avatarUrl: record.avatarUrl } : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): Runner => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            update,
            with: withOptions,
            toDTO,
            toJSON
        }) as RunnerVO;
    };

    return {
        create(input: RunnerInsert): RunnerVO {
            RunnerVO.validateInput(input);
            return make({
                id: uuidv7() as UUIDv7,
                userId: input.userId,
                totalDistance: input.totalDistance,
                averagePace: input.averagePace,
                totalRuns: input.totalRuns,
                bestMileTime: input.bestMileTime,
                status: 'pending',
                isPooled: false,
                runnerWallet: input.runnerWallet,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        },

        from(
            data: Runner,
            options?: { username?: string; avatarUrl?: string }
        ): RunnerVO {
            if (!options) {
                return make(data);
            }

            return make({
                ...data,
                ...(options.username !== undefined
                    ? { username: options.username }
                    : {}),
                ...(options.avatarUrl !== undefined
                    ? { avatarUrl: options.avatarUrl }
                    : {})
            });
        },

        validateInput(input: RunnerInsert): void {
            if (!input.userId) {
                throw new InputError('User ID is required');
            }

            if (!input.runnerWallet) {
                throw new InputError('Runner wallet is required');
            }

            if (input.totalDistance && input.totalDistance < 0) {
                throw new InputError('Total distance cannot be negative');
            }

            if (input.averagePace && input.averagePace < 0) {
                throw new InputError('Average pace cannot be negative');
            }

            if (input.bestMileTime && input.bestMileTime < 0) {
                throw new InputError('Best mile time cannot be negative');
            }

            if (input.totalRuns && input.totalRuns < 0) {
                throw new InputError('Total runs cannot be negative');
            }
        },

        validateUpdate(input: RunnerUpdate): void {
            if (input.totalDistance && input.totalDistance < 0) {
                throw new InputError('Total distance cannot be negative');
            }

            if (input.averagePace && input.averagePace < 0) {
                throw new InputError('Average pace cannot be negative');
            }

            if (input.bestMileTime && input.bestMileTime < 0) {
                throw new InputError('Best mile time cannot be negative');
            }

            if (input.totalRuns && input.totalRuns < 0) {
                throw new InputError('Total runs cannot be negative');
            }
        }
    };
})();
