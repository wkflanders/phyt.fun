import {
    db,
    eq,
    or,
    desc,
    users,
    transactions,
    cards,
    card_metadata
} from '@phyt/database';

import type { User, CardWithMetadata } from '@phyt/types';

export const userRepository = {
    findByPrivyId: async (privyId: string): Promise<User[]> => {
        return db
            .select()
            .from(users)
            .where(eq(users.privy_id, privyId))
            .limit(1);
    },

    findByWalletAddress: async (address: string): Promise<User[]> => {
        return db
            .select()
            .from(users)
            .where(eq(users.wallet_address, address))
            .limit(1);
    },

    findById: async (id: number): Promise<User[]> => {
        return db.select().from(users).where(eq(users.id, id)).limit(1);
    },

    findByEmail: async (email: string): Promise<User[]> => {
        return db.select().from(users).where(eq(users.email, email)).limit(1);
    },

    findByUsername: async (username: string): Promise<User[]> => {
        return db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);
    },

    listTransactions: async (userId: number): Promise<Transaction[]> => {
        return db
            .select()
            .from(transactions)
            .where(
                or(
                    eq(transactions.from_user_id, userId),
                    eq(transactions.to_user_id, userId)
                )
            )
            .orderBy(desc(transactions.created_at));
    },

    listCards: async (userId: number): Promise<CardWithMetadata[]> => {
        const records = await db
            .select()
            .from(cards)
            .innerJoin(
                card_metadata,
                eq(cards.token_id, card_metadata.token_id)
            )
            .where(eq(cards.owner_id, userId));
        return records.map(({ cards, card_metadata }) => ({
            ...cards,
            metadata: { ...card_metadata }
        }));
    },

    create: async (data: {
        email: string;
        username: string;
        privy_id: string;
        wallet_address: string;
        avatar_url: string;
    }): Promise<User> => {
        const [newUser] = await db
            .insert(users)
            .values({
                email: data.email,
                username: data.username,
                privy_id: data.privy_id,
                wallet_address: data.wallet_address,
                avatar_url: data.avatar_url,
                role: 'user',
                phytness_points: 0
            })
            .returning();
        return newUser;
    }
};
