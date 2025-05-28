import { uuidv7 } from 'uuidv7';

import { DefaultAvatar } from './core.js';
import { InputError } from './errors.js';

import type {
    UUIDv7,
    User,
    UserInsert,
    UserUpdate,
    RunnerStatus
} from '@phyt/types';

export interface UsersVO extends User {
    update({ update }: { update: UserUpdate }): UsersVO;
    remove(): UsersVO;
    with(options: { status?: RunnerStatus }): UsersVO;
    toDTO<T extends User = User>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): User;
}

export const UsersVO = (() => {
    const make = (user: User): UsersVO => {
        const update = ({ update }: { update: UserUpdate }): UsersVO => {
            UsersVO.validateUpdate(update);
            return make({
                ...user,
                ...update,
                updatedAt: new Date()
            });
        };

        const remove = (): UsersVO => {
            return make({
                ...user,
                deletedAt: new Date()
            });
        };

        const withOptions = ({
            options
        }: {
            options: { status?: RunnerStatus };
        }): UsersVO => {
            return make({
                ...user,
                ...(options.status !== undefined
                    ? { status: options.status }
                    : {})
            });
        };

        const toDTO = <T extends User = User>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            return {
                ...user,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt),
                ...(user.status ? { status: user.status } : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): User => ({ ...user });

        return Object.freeze({
            ...toDTO(),
            update,
            remove,
            with: withOptions,
            toDTO,
            toJSON
        }) as UsersVO;
    };

    const _isValidUrl = ({ urlString }: { urlString: string }): boolean => {
        try {
            const url = new URL(urlString);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    };

    return {
        create({ input }: { input: UserInsert }): UsersVO {
            UsersVO.validateInput(input);
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
                updatedAt: new Date(),
                deletedAt: null
            });
        },

        from({
            user,
            options
        }: {
            user: User;
            options?: { status?: RunnerStatus };
        }): UsersVO {
            if (!options) {
                return make(user);
            }

            return make({
                ...user,
                ...(options.status !== undefined
                    ? { status: options.status }
                    : {})
            });
        },

        validateInput(input: UserInsert): void {
            if (
                input.avatarUrl &&
                !_isValidUrl({ urlString: input.avatarUrl })
            ) {
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
                if (!_isValidUrl({ urlString: input.avatarUrl })) {
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
