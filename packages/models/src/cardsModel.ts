import { uuidv7 } from 'uuidv7';

import { UUIDv7, Card, CardInsert, CardUpdate, Metadata } from '@phyt/types';

import { InputError } from './errors.js';

export interface CardsVO extends Card {
    update(update: CardUpdate): CardsVO;
    with(options: { metadata?: Metadata }): CardsVO;
    toDTO<T extends Card = Card>(options?: { [K in keyof T]?: T[K] }): T;
    toJSON(): Card;
}

export const CardsVO = (() => {
    const make = (record: Card & { metadata?: Metadata }): CardsVO => {
        const update = (updateData: CardUpdate): CardsVO => {
            CardsVO.validateUpdate(updateData);
            return make({
                ...record,
                ...updateData,
                updatedAt: new Date()
            });
        };

        const withOptions = (options: { metadata?: Metadata }): CardsVO => {
            return make({
                ...record,
                ...(options.metadata !== undefined
                    ? { metadata: options.metadata }
                    : {})
            });
        };

        const toDTO = <T extends Card = Card>(options?: {
            [K in keyof T]?: T[K];
        }): T => {
            return {
                ...record,
                createdAt: new Date(record.createdAt),
                updatedAt: new Date(record.updatedAt),
                ...(record.metadata ? { metadata: record.metadata } : {}),
                ...(options ?? {})
            } as T;
        };

        const toJSON = (): Card => ({ ...record });

        return Object.freeze({
            ...toDTO(),
            update,
            with: withOptions,
            toDTO,
            toJSON
        }) as CardsVO;
    };

    return {
        create(input: CardInsert): CardsVO {
            CardsVO.validateInput(input);
            return make({
                id: uuidv7() as UUIDv7,
                ownerId: input.ownerId,
                packPurchaseId: input.packPurchaseId,
                tokenId: input.tokenId,
                isBurned: input.isBurned ?? false,
                acquisitionType: input.acquisitionType,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        },

        from(data: Card, options?: { metadata?: Metadata }): CardsVO {
            if (!options) {
                return make(data);
            }

            return make({
                ...data,
                ...(options.metadata !== undefined
                    ? { metadata: options.metadata }
                    : {}),
                updatedAt: new Date()
            });
        },

        validateInput(input: CardInsert): void {
            if (!input.ownerId) {
                throw new InputError('Owner ID is required');
            }
        },

        validateUpdate(input: CardUpdate): void {
            if (
                input.isBurned !== undefined &&
                typeof input.isBurned !== 'boolean'
            ) {
                throw new InputError('isBurned must be a boolean');
            }
        }
    };
})();
