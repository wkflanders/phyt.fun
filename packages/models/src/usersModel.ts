import { uuidv7 } from 'uuidv7';

import { DefaultAvatar } from './core.js';
import { InputError } from './errors.js';

import type {
    User,
    UUIDv7,
    UserInsert,
    RunnerStatus,
    UserUpdate
} from '@phyt/types';

export interface UserVO extends User {
    update(update: UserUpdate): UserVO;
    with(options: { status?: RunnerStatus }): UserVO;
    toDTO<T extends User = User>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): User;
}

export const UserVO = (() => {
    const make = (record: User & { status?: RunnerStatus }): UserVO => {
        const update = (updateData: UserUpdate): UserVO => {
            UserVO.validateUpdate(updateData);
            return make({
                ...record,
                ...updateData,
                updatedAt: new Date()
            });
        };

        const withOptions = (options: { status?: RunnerStatus }): UserVO => {
            return make({
                ...record,
                ...(options.status !== undefined
                    ? { status: options.status }
                    : {})
            });
        };

        const toDTO = <T extends User = User>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            return {
                ...record,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
                ...(record.status ? { status: record.status } : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): User => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            update,
            with: withOptions,
            toDTO,
            toJSON
        }) as UserVO;
    };

    const _isValidUrl = (urlString: string): boolean => {
        try {
            const url = new URL(urlString);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    };

    return {
        create(input: UserInsert): UserVO {
            UserVO.validateInput(input);
            return make({
                id: uuidv7() as UUIDv7,
                email: input.email,
                username: input.username,
                role: input.role ?? 'user',
                privyId: input.privyId,
                avatarUrl: input.avatarUrl ?? DefaultAvatar,
                walletAddress: input.walletAddress,
                phytnessPoints: input.phytnessPoints ?? 0,
                twitterHandle: input.twitterHandle ?? null,
                stravaHandle: input.stravaHandle ?? null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        },

        from(data: User, options?: { status?: RunnerStatus }): UserVO {
            if (!options) {
                return make(data);
            }

            return make({
                ...data,
                ...(options.status !== undefined
                    ? { status: options.status }
                    : {})
            });
        },

        validateInput(input: UserInsert): void {
            if (input.avatarUrl && !_isValidUrl(input.avatarUrl)) {
                throw new InputError('Avatar URL must be a valid URL');
            }

            if (!input.email.includes('@')) {
                throw new InputError('Valid email is required');
            }

            if (!input.username || input.username.trim() === '') {
                throw new InputError('Username cannot be empty');
            }

            if (!input.privyId) {
                throw new InputError('Privy ID is required');
            }

            if (typeof input.walletAddress === 'string') {
                const walletAddressRegex = /^0x[a-fA-F0-9]{40}$/;
                if (!walletAddressRegex.test(input.walletAddress)) {
                    throw new InputError('Invalid wallet address format');
                }
            }
        },

        validateUpdate(input: UserUpdate): void {
            if (input.avatarUrl) {
                if (!_isValidUrl(input.avatarUrl)) {
                    throw new InputError('Avatar URL must be a valid URL');
                }
            }

            if (input.twitterHandle) {
                if (input.twitterHandle.startsWith('@')) {
                    throw new InputError(
                        'Twitter handle should not include @ symbol'
                    );
                }

                const twitterRegex = /^[a-zA-Z0-9_]{1,15}$/;
                if (!twitterRegex.test(input.twitterHandle)) {
                    throw new InputError(
                        'Twitter handle should only contain letters, numbers and underscores, and be 15 characters or less'
                    );
                }
            }

            if (input.stravaHandle) {
                const stravaRegex = /^[a-zA-Z0-9_\-.]{1,30}$/;
                if (!stravaRegex.test(input.stravaHandle)) {
                    throw new InputError(
                        'Strava handle contains invalid characters'
                    );
                }
            }
        }
    };
})();
