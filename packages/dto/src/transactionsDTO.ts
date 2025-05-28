import {
    UUIDv7,
    Transaction,
    TransactionInsert,
    TransactionUpdate,
    TransactionQueryParams,
    PaginatedTransactions
} from '@phyt/types';

import { z } from 'zod';


import { CardIdSchema } from './cardsDTO.js';
import { CompetitionIdSchema } from './competitionsDTO.js';
import { PaginationSchema, uuidv7 } from './core.js';
import { PackPurchaseIdSchema } from './packsDTO.js';
import { UserIdSchema } from './usersDTO.js';

/* ---------- Inbound DTOs ---------- */
export const TransactionIdSchema = z.object({
    transactionId: uuidv7()
});
export type TransactionIdDTO = z.infer<typeof TransactionIdSchema> & UUIDv7;

export const TransactionStatusSchema = z.enum([
    'pending',
    'confirmed',
    'failed'
]);

export const TransactionTypeSchema = z.enum([
    'packPurchase',
    'marketplaceSale',
    'marketplaceOffer',
    'marketplaceListing',
    'rewardPayout'
]);

export const TransactionQueryParamsSchema = z.object({
    page: z.number().min(1),
    limit: z.number().min(1).max(100),
    parentOnly: z.boolean().optional(),
    status: TransactionStatusSchema.optional()
});
export type TransactionQueryParamsDTO = z.infer<
    typeof TransactionQueryParamsSchema
> &
    TransactionQueryParams;

export const CreateTransactionSchema = z.object({
    fromUserId: UserIdSchema.nullable(),
    toUserId: UserIdSchema.nullable(),
    cardId: CardIdSchema.nullable(),
    competitionId: CompetitionIdSchema.nullable(),
    price: z.string().nullable(),
    transactionType: TransactionTypeSchema,
    packPurchaseId: PackPurchaseIdSchema.nullable(),
    status: TransactionStatusSchema,
    hash: z.string()
});
export type CreateTransactionDTO = z.infer<typeof CreateTransactionSchema> &
    TransactionInsert;

export const UpdateTransactionSchema = z.object({
    fromUserId: UserIdSchema.nullable(),
    toUserId: UserIdSchema.nullable(),
    cardId: CardIdSchema.nullable(),
    transactionType: TransactionTypeSchema,
    status: TransactionStatusSchema,
    hash: z.string()
});
export type UpdateTransactionDTO = z.infer<typeof UpdateTransactionSchema> &
    TransactionUpdate;

/* ---------- Outbound DTOs ---------- */
export const TransactionSchema = z.object({
    id: TransactionIdSchema,
    fromUserId: UserIdSchema.nullable(),
    toUserId: UserIdSchema.nullable(),
    cardId: CardIdSchema.nullable(),
    competitionId: CompetitionIdSchema.nullable(),
    price: z.string().nullable(),
    transactionType: TransactionTypeSchema,
    packPurchaseId: PackPurchaseIdSchema.nullable(),
    status: TransactionStatusSchema,
    hash: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
});
export type TransactionDTO = z.infer<typeof TransactionSchema> & Transaction;

export const TransactionsPageSchema = z.object({
    transactions: z.array(TransactionSchema),
    pagination: PaginationSchema
});
export type TransactionsPageDTO = z.infer<typeof TransactionsPageSchema> &
    PaginatedTransactions;
