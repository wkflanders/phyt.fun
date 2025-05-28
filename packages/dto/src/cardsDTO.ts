import { UUIDv7, Card, CardInsert, CardUpdate } from '@phyt/types';

import { z } from 'zod';


import { uuidv7 } from './core.js';
import { PackPurchaseIdSchema } from './packsDTO.js';
import { UserIdSchema } from './usersDTO.js';

/* ---------- Inbound DTOs ---------- */
export const CardIdSchema = z.object({
    cardId: uuidv7()
});
export type CardIdDTO = z.infer<typeof CardIdSchema> & UUIDv7;

export const CardInsertSchema = z.object({
    cardId: CardIdSchema,
    userId: UserIdSchema,
    packPurchaseId: PackPurchaseIdSchema,
    tokenId: z.number(),
    isBurned: z.boolean(),
    acquisitionType: z.enum(['mint', 'transfer', 'marketplace']),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});
export type CardInsertDTO = z.infer<typeof CardInsertSchema> & CardInsert;

export const CardUpdateSchema = z.object({
    cardId: CardIdSchema,
    userId: UserIdSchema,
    tokenId: z.number(),
    packPurchaseId: PackPurchaseIdSchema,
    isBurned: z.boolean(),
    acquisitionType: z.enum(['mint', 'transfer', 'marketplace'])
});
export type CardUpdateDTO = z.infer<typeof CardUpdateSchema> & CardUpdate;

/* ---------- Outbound DTOs ---------- */
export const CardSchema = z.object({
    cardId: CardIdSchema,
    userId: UserIdSchema,
    packPurchaseId: PackPurchaseIdSchema,
    tokenId: z.number(),
    isBurned: z.boolean(),
    acquisitionType: z.enum(['mint', 'transfer', 'marketplace']),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
});
export type CardDTO = z.infer<typeof CardSchema> & Card;
