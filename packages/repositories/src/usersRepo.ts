import { UserVO } from '@phyt/models';
import { UUIDv7, User, UserInsert, ISODate } from '@phyt/types';

import type { UsersDrizzleOps } from '@phyt/drizzle';

export type UsersRepository = ReturnType<typeof makeUsersRepository>;

export const makeUsersRepository = (ops: UsersDrizzleOps) => {
    function toVO(data: User): User {
        return UserVO.fromRecord({
            ...data,
            createdAt: data.createdAt.toISOString() as ISODate,
            updatedAt: data.updatedAt.toISOString() as ISODate
        });
    }

    return {
        create: async (input: UserInsert): Promise<User> => {
            const data = await ops.create(input);
            return toVO(data);
        },

        findByPrivyId: async (privyId: string): Promise<User> => {
            const data = await ops.findByPrivyId(privyId);
            return toVO(data);
        },

        findByWalletAddress: async (walletAddress: string): Promise<User> => {
            const data = await ops.findByWalletAddress(walletAddress);
            return toVO(data);
        },

        findById: async (id: UUIDv7): Promise<User> => {
            const data = await ops.findById(id);
            return toVO(data);
        },

        findByEmail: async (email: string): Promise<User> => {
            const data = await ops.findByEmail(email);
            return toVO(data);
        },

        findByUsername: async (username: string): Promise<User> => {
            const data = await ops.findByUsername(username);
            return toVO(data);
        }

        // findTransactionById: async (userId: UUIDv7): Promise<Transaction> => {
        //     const data = await ops.findTransactionById(userId);
        //     return TransactionVO.fromRecord({
        //         ...data,
        //         createdAt: data.createdAt.toISOString() as ISODate,
        //         updatedAt: data.updatedAt.toISOString() as ISODate
        //     });
        // },

        // findCardsByPrivyId: async (
        //     privyId: string
        // ): Promise<CardWithMetadata[]> => {
        //     const data = await ops.findCardsByPrivyId(privyId);
        //     return data.map((card) =>
        //         CardVO.fromRecord({
        //             ...card,
        //             createdAt: card.createdAt.toISOString() as ISODate,
        //             updatedAt: card.updatedAt.toISOString() as ISODate
        //         })
        //     );
        // }
    };
};
