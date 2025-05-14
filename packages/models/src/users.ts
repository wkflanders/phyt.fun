import { z } from 'zod';

import {
    User,
    UserWithStatus,
    UserRecord,
    CreateUserInput,
    ISODate,
    DefaultAvatar
} from '@phyt/types';

import { isUUIDv7, Iso } from './core.js';
import { InputError } from './errors.js';
export interface UserVO extends UserWithStatus {
    // Stuff that can be mutated
    // So ex. edd updateUsername here at some point
    updateAvatar(url: string): UserVO;
    toDTO(): User;
    toJSON(): UserRecord;
}

export const UserVO = (() => {
    const make = (
        record: UserRecord & { status: 'active' | 'disabled' }
    ): UserVO => {
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
            status: record.status,
            updateAvatar,
            toDTO,
            toJSON
        }) as UserVO;
    };
    return {
        create(input: CreateUserInput): UserVO {
            return make({
                id: undefined,
                email: input.email,
                username: input.username,
                role: 'user',
                privyId: input.privyId,
                avatarUrl: DefaultAvatar,
                walletAddress: input.walletAddress,
                phytnessPoints: 0,
                twitterHandle: null,
                stravaHandle: null,
                createdAt: new Date().toISOString() as ISODate,
                updatedAt: new Date().toISOString() as ISODate,
                status: 'active'
            });
        },

        fromRecord(raw: unknown): UserVO {
            const rec = z
                .object({
                    id: z.custom(isUUIDv7),
                    email: z.string().email(),
                    username: z.string(),
                    role: z.enum(['user', 'runner', 'admin']),
                    privyId: z.string(),
                    avatarUrl: z.string().url(),
                    walletAddress: z
                        .string({
                            required_error: 'Wallet address is required'
                        })
                        .regex(
                            /^0x[a-fA-F0-9]+$/,
                            'Wallet address must be a valid address'
                        )
                        .transform((val) => val as `0x${string}`),
                    phytnessPoints: z.number(),
                    twitterHandle: z.string().nullable(),
                    stravaHandle: z.string().nullable(),
                    createdAt: Iso(),
                    updatedAt: Iso()
                })
                .parse(raw);
            return make({ ...rec, status: 'active' });
        }
    };
})();
