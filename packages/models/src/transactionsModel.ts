import { uuidv7 } from 'uuidv7';

import {
    UUIDv7,
    Transaction,
    TransactionInsert,
    TransactionUpdate
} from '@phyt/types';

import { InputError } from './errors.js';

export interface TransactionsVO extends Transaction {
    update(update: TransactionUpdate): TransactionsVO;
    toDTO<T extends Transaction = Transaction>(options?: {
        [K in keyof T]?: T[K];
    }): T;
    toJSON(): Transaction;
}

export const TransactionsVO = (() => {
    const make = (record: Transaction): TransactionsVO => {
        const update = (updateData: TransactionUpdate): TransactionsVO => {
            TransactionsVO.validateUpdate(updateData);
            return make({
                ...record,
                ...updateData,
                updatedAt: new Date()
            });
        };

        const toDTO = <T extends Transaction = Transaction>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            return {
                ...record,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): Transaction => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            update,
            toDTO,
            toJSON
        }) as TransactionsVO;
    };

    return {
        create(input: TransactionInsert): TransactionsVO {
            TransactionsVO.validateInput(input);
            return make({
                id: uuidv7() as UUIDv7,
                fromUserId: input.fromUserId ?? null,
                toUserId: input.toUserId ?? null,
                cardId: input.cardId ?? null,
                competitionId: input.competitionId ?? null,
                price: input.price ?? null,
                transactionType: input.transactionType,
                status: input.status,
                packPurchaseId: input.packPurchaseId ?? null,
                hash: input.hash,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        },

        from(data: Transaction): TransactionsVO {
            return make(data);
        },

        validateInput(input: TransactionInsert): void {
            if (typeof input.hash === 'string' && input.hash.trim() === '') {
                throw new InputError('Transaction hash cannot be empty');
            }

            if (!input.fromUserId) {
                throw new InputError('From user ID is required');
            }

            if (!input.toUserId) {
                throw new InputError('To user ID is required');
            }
        },

        validateUpdate(input: TransactionUpdate): void {
            if (!input.hash) {
                throw new InputError('Transaction hash is required');
            }
        }
    };
})();
