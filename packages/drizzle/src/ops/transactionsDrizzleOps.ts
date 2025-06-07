import { eq, or, desc, count } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { transactions } from '../schema.js';

import type {
    UUIDv7,
    Transaction,
    TransactionInsert,
    TransactionStatus,
    TransactionQueryParams,
    PaginatedTransactions
} from '@phyt/types';

const toTransaction = (
    transactionRow: typeof transactions.$inferSelect
): Transaction => {
    return {
        id: transactionRow.id as UUIDv7,
        fromUserId: transactionRow.fromUserId as UUIDv7,
        toUserId: transactionRow.toUserId as UUIDv7,
        cardId: transactionRow.cardId as UUIDv7,
        competitionId: transactionRow.competitionId as UUIDv7 | null,
        packPurchaseId: transactionRow.packPurchaseId as UUIDv7 | null,
        price: transactionRow.price,
        transactionType: transactionRow.transactionType,
        hash: transactionRow.hash,
        status: transactionRow.status as TransactionStatus,
        createdAt: transactionRow.createdAt,
        updatedAt: transactionRow.updatedAt
    };
};

export type TransactionsDrizzleOps = ReturnType<
    typeof makeTransactionsDrizzleOps
>;

export const makeTransactionsDrizzleOps = (db: DrizzleDB) => {
    const create = async (input: TransactionInsert): Promise<Transaction> => {
        const [row] = await db
            .insert(transactions)
            .values({ ...input, id: uuidv7() as UUIDv7 })
            .returning();

        return toTransaction(row);
    };

    const paginate = async (
        cond: ReturnType<typeof eq> | ReturnType<typeof or>,
        params: TransactionQueryParams
    ): Promise<PaginatedTransactions> => {
        const { page = 1, limit = 20 } = params;
        const offset = (page - 1) * limit;

        const [{ total }] = await db
            .select({ total: count() })
            .from(transactions)
            .where(cond);

        const rows = await db
            .select()
            .from(transactions)
            .where(cond)
            .orderBy(desc(transactions.createdAt), desc(transactions.id))
            .limit(limit)
            .offset(offset);

        return {
            transactions: rows.map(toTransaction),
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.max(1, Math.ceil(Number(total) / limit))
            }
        };
    };

    return { create };
};
