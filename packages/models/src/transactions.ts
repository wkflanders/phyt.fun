import { UUIDv7 } from '@phyt/types';

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
    hash: string | null;
    createdAt: Date;
    updatedAt: Date;
}
