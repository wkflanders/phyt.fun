import { DefaultAvatar } from './core.js';
import { InputError } from './errors.js';

import type {
    ISODate,
    UserRecord,
    UserInsert,
    User,
    UUIDv7,
    UserWithStatus,
    RunnerStatus
} from '@phyt/types';

export interface UserVO extends User {
    updateProfile(update: {
        twitterHandle?: string | null;
        stravaHandle?: string | null;
    }): UserVO;
    updateAvatar(url: string): UserVO;
    withStatus(status: RunnerStatus | undefined): UserWithStatusVO;
    toDTO<T extends User = User>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): UserRecord;
}

export interface UserWithStatusVO extends UserVO, UserWithStatus {
    toDTO<T extends UserWithStatus = UserWithStatus>(options?: {
        [K in keyof T]?: T[K];
    }): T;
}

export const UserVO = (() => {
    const make = (record: UserRecord): UserVO => {
        const updateProfile = (update: {
            twitterHandle?: string | null;
            stravaHandle?: string | null;
        }): UserVO => {
            return make({
                ...record,
                ...update,
                updatedAt: new Date().toISOString() as ISODate
            });
        };

        const updateAvatar = (avatarUrl: string): UserVO => {
            if (!avatarUrl || avatarUrl.trim() === '') {
                throw new InputError('Avatar URL cannot be empty');
            }

            if (!isValidUrl(avatarUrl)) {
                throw new InputError('Avatar URL must be a valid URL');
            }

            return make({
                ...record,
                avatarUrl,
                updatedAt: new Date().toISOString() as ISODate
            });
        };

        const withStatus = (
            status: RunnerStatus | undefined
        ): UserWithStatusVO => {
            return makeWithStatus(record, status);
        };

        const toDTO = <T extends User = User>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            if (!record.id) throw new InputError('User id is required');
            return {
                id: record.id,
                email: record.email,
                username: record.username,
                role: record.role,
                privyId: record.privyId,
                avatarUrl: record.avatarUrl,
                walletAddress: record.walletAddress,
                phytnessPoints: record.phytnessPoints,
                twitterHandle: record.twitterHandle,
                stravaHandle: record.stravaHandle,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): UserRecord => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            updateProfile,
            updateAvatar,
            withStatus,
            toDTO,
            toJSON
        }) as UserVO;
    };

    const makeWithStatus = (
        record: UserRecord,
        status: RunnerStatus | undefined
    ): UserWithStatusVO => {
        const userVO = make(record);

        const toDTOWithStatus = <
            T extends UserWithStatus = UserWithStatus
        >(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            const baseDTO = userVO.toDTO();
            return {
                ...baseDTO,
                status,
                ...(options ?? {})
            } as T;
        };

        return Object.freeze({
            ...userVO,
            status,
            toDTO: toDTOWithStatus
        }) as UserWithStatusVO;
    };

    // Utility function to validate URLs
    const isValidUrl = (urlString: string): boolean => {
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

            // Set default avatar if not provided
            const avatarUrl = input.avatarUrl ?? DefaultAvatar;

            // Validate avatar URL if provided
            if (input.avatarUrl && !isValidUrl(input.avatarUrl)) {
                throw new InputError('Avatar URL must be a valid URL');
            }

            return make({
                id: undefined as unknown as UUIDv7,
                email: input.email,
                username: input.username,
                role: input.role ?? 'user',
                privyId: input.privyId,
                avatarUrl,
                walletAddress: input.walletAddress,
                phytnessPoints: input.phytnessPoints ?? 0,
                twitterHandle: input.twitterHandle ?? null,
                stravaHandle: input.stravaHandle ?? null,
                createdAt: new Date().toISOString() as ISODate,
                updatedAt: new Date().toISOString() as ISODate
            });
        },

        fromRecord(record: UserRecord): UserVO {
            return make(record);
        },

        fromWithStatus(
            data: User & { status?: RunnerStatus }
        ): UserWithStatusVO {
            return makeWithStatus(
                {
                    id: data.id,
                    email: data.email,
                    username: data.username,
                    role: data.role,
                    privyId: data.privyId,
                    avatarUrl: data.avatarUrl,
                    walletAddress: data.walletAddress,
                    phytnessPoints: data.phytnessPoints,
                    twitterHandle: data.twitterHandle,
                    stravaHandle: data.stravaHandle,
                    createdAt: (data.createdAt instanceof Date
                        ? data.createdAt.toISOString()
                        : data.createdAt) as ISODate,
                    updatedAt: (data.updatedAt instanceof Date
                        ? data.updatedAt.toISOString()
                        : data.updatedAt) as ISODate
                },
                data.status
            );
        },

        validateInput(input: UserInsert): void {
            if (!input.email.includes('@')) {
                throw new InputError('Valid email is required');
            }

            if (!input.username || input.username.trim() === '') {
                throw new InputError('Username cannot be empty');
            }

            if (!input.privyId) {
                throw new InputError('Privy ID is required');
            }

            // Validate wallet address if provided and it's a string
            if (typeof input.walletAddress === 'string') {
                const walletAddressRegex = /^0x[a-fA-F0-9]{40}$/;
                if (!walletAddressRegex.test(input.walletAddress)) {
                    throw new InputError('Invalid wallet address format');
                }
            }
        },

        validateUpdate(input: {
            twitterHandle?: string | null;
            stravaHandle?: string | null;
        }): void {
            // Validate twitter handle format
            if (input.twitterHandle) {
                if (input.twitterHandle.startsWith('@')) {
                    throw new InputError(
                        'Twitter handle should not include @ symbol'
                    );
                }

                // Check for valid characters
                const twitterRegex = /^[a-zA-Z0-9_]{1,15}$/;
                if (!twitterRegex.test(input.twitterHandle)) {
                    throw new InputError(
                        'Twitter handle should only contain letters, numbers and underscores, and be 15 characters or less'
                    );
                }
            }

            // Validate Strava handle if provided
            if (input.stravaHandle) {
                // Simple validation - adjust as needed for Strava's actual rules
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
