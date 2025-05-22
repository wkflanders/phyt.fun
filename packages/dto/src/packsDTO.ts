import { z } from 'zod';

import { UUIDv7 } from '@phyt/types';

import { PaginationSchema, uuidv7 } from './core.js';

/* ---------- Inbound DTOs ---------- */
export const PackPurchaseIdSchema = z.object({
    packPurchaseId: uuidv7()
});
export type PackPurchaseIdDTO = z.infer<typeof PackPurchaseIdSchema> & UUIDv7;
