import { uuidv7 } from 'uuidv7';

import { InputError } from './errors.js';

import type { UUIDv7, Runner, RunnerInsert, RunnerUpdate } from '@phyt/types';

export interface RunnerVO extends Runner {
    update({ update }: { update: RunnerUpdate }): RunnerVO;
    remove(): RunnerVO;
    with(options: { username?: string; avatarUrl?: string }): RunnerVO;
    toDTO<T extends Runner = Runner>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): Runner;
}

export const RunnerVO = (() => {
    const make = (runner: Runner): RunnerVO => {
        const update = ({ update }: { update: RunnerUpdate }): RunnerVO => {
            RunnerVO.validateUpdate(update);
            return make({
                ...runner,
                ...update,
                updatedAt: new Date()
            });
        };

        const remove = (): RunnerVO => {
            return make({
                ...runner,
                deletedAt: new Date()
            });
        };

        const withOptions = (options: {
            username?: string;
            avatarUrl?: string;
        }): RunnerVO => {
            return make({
                ...runner,
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
                ...runner,
                createdAt: new Date(runner.createdAt),
                updatedAt: new Date(runner.updatedAt),
                ...(runner.username ? { username: runner.username } : {}),
                ...(runner.avatarUrl ? { avatarUrl: runner.avatarUrl } : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): Runner => ({ ...runner });

        return Object.freeze({
            ...toDTO(),
            update,
            remove,
            with: withOptions,
            toDTO,
            toJSON
        }) as RunnerVO;
    };

    return {
        create({ input }: { input: RunnerInsert }): RunnerVO {
            RunnerVO.validateInput(input);
            return make({
                id: uuidv7() as UUIDv7,
                userId: input.userId,
                totalDistance: input.totalDistance,
                averagePace: input.averagePace,
                totalRuns: input.totalRuns,
                bestMileTime: input.bestMileTime,
                status: input.status,
                isPooled: input.isPooled,
                runnerWallet: input.runnerWallet,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            });
        },

        from({
            runner,
            options
        }: {
            runner: Runner;
            options?: { username?: string; avatarUrl?: string };
        }): RunnerVO {
            if (!options) {
                return make(runner);
            }

            return make({
                ...runner,
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
