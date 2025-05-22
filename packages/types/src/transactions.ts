import { UUIDv7, Pagination } from './core.js';

export type AcquisitionType = 'mint' | 'transfer' | 'marketplace';

export type TransactionType =
    | 'packPurchase'
    | 'marketplaceSale'
    | 'marketplaceOffer'
    | 'marketplaceListing'
    | 'rewardPayout';

export interface Transaction {
    id: UUIDv7;
    fromUserId: UUIDv7 | null;
    toUserId: UUIDv7 | null;
    cardId: UUIDv7 | null;
    competitionId: UUIDv7 | null;
    price: string | null;
    transactionType: TransactionType;
    packPurchaseId: UUIDv7 | null;
    hash: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TransactionInsert {
    fromUserId: UUIDv7 | null;
    toUserId: UUIDv7 | null;
    cardId: UUIDv7 | null;
    competitionId: UUIDv7 | null;
    price: string | null;
    transactionType: TransactionType;
    packPurchaseId: UUIDv7 | null;
    hash: string;
}

export interface TransactionUpdate {
    fromUserId: UUIDv7 | null;
    toUserId: UUIDv7 | null;
    cardId: UUIDv7 | null;
    transactionType: TransactionType;
    hash: string;
}

export interface TransactionQueryParams {
    page?: number;
    limit?: number;
    parentOnly?: boolean;
}

export interface PaginatedTransactions<T = Transaction> {
    transactions: T[];
    pagination?: Pagination;
}
