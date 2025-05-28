import { UUIDv7, Pagination } from './core.js';

export type AcquisitionType = 'mint' | 'transfer' | 'marketplace';

export type TransactionType =
    | 'packPurchase'
    | 'marketplaceSale'
    | 'marketplaceOffer'
    | 'marketplaceListing'
    | 'rewardPayout';

export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
    id: UUIDv7;
    fromUserId: UUIDv7;
    toUserId: UUIDv7;
    cardId: UUIDv7;
    competitionId: UUIDv7 | null;
    packPurchaseId: UUIDv7 | null;
    price: string;
    transactionType: TransactionType;
    status: TransactionStatus;
    hash: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TransactionInsert {
    fromUserId: UUIDv7;
    toUserId: UUIDv7;
    cardId: UUIDv7;
    competitionId?: UUIDv7 | null;
    packPurchaseId?: UUIDv7 | null;
    price: string;
    transactionType: TransactionType;
    status: TransactionStatus;
    hash: string;
}

export interface TransactionUpdate {
    price?: string;
    status?: TransactionStatus;
    hash: string;
}

export interface TransactionQueryParams {
    page?: number;
    limit?: number;
    parentOnly?: boolean;
    status?: TransactionStatus;
}

export interface PaginatedTransactions<T = Transaction> {
    transactions: T[];
    pagination: Pagination;
}
