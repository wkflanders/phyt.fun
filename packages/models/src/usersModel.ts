import {
    ISODate,
    DefaultAvatar,
    UserRecord,
    UserInsert,
    User,
    UUIDv7
} from '@phyt/types';

import { InputError } from './errors.js';

export interface UserVO extends User {
    updateAvatar(url: string): UserVO;
    toDTO(): User;
    toJSON(): UserRecord;
}

export const UserVO = (() => {
    const make = (record: UserRecord): UserVO => {
        const updateAvatar = (avatarUrl: string) =>
            make({
                ...record,
                avatarUrl,
                updatedAt: new Date().toISOString() as ISODate
            });

        const toDTO = (): User => {
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
                updatedAt: new Date(record.updatedAt)
            };
        };

        const toJSON = (): UserRecord => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            updateAvatar,
            toDTO,
            toJSON
        }) as UserVO;
    };

    return {
        create(input: UserInsert): UserVO {
            UserVO.validate(input);
            return make({
                id: undefined as unknown as UUIDv7,
                email: input.email,
                username: input.username,
                role: input.role ?? 'user',
                privyId: input.privyId,
                avatarUrl: input.avatarUrl ?? DefaultAvatar,
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

        validate(input: UserInsert): void {
            if (!input.email.includes('@')) {
                throw new InputError('Valid email is required');
            }

            if (!input.username || input.username.trim() === '') {
                throw new InputError('Username cannot be empty');
            }

            if (!input.privyId) {
                throw new InputError('Privy ID is required');
            }

            if (!/^0x[a-fA-F0-9]{40}$/.test(input.walletAddress)) {
                throw new InputError('Invalid wallet address');
            }
        }
    };
})();
