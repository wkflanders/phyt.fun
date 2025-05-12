import { z } from 'zod';

import { isUUIDv7 } from '@phyt/models';

export const PaginationSchema = z
    .object({
        page: z.number().int().nonnegative(),
        limit: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        totalPages: z.number().int().nonnegative()
    })
    .strict();

export const uuidv7 = () =>
    z
        .string()
        .refine(isUUIDv7, { message: 'Invalid UUIDv7' })
        .transform((s) => s);
