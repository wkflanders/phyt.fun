import { z, ZodType, ZodTypeDef } from 'zod';

import { isUUIDv7, Pagination } from '@phyt/models';

export type DTOSchema<T> = ZodType<T, ZodTypeDef, unknown>;

export const PaginationSchema: DTOSchema<Pagination> = z
    .object({
        page: z.number().int().nonnegative(),
        limit: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        totalPages: z.number().int().nonnegative()
    })
    .strict();

export const uuidv7 = ({ required_error }: { required_error: string }) =>
    z
        .string({
            required_error
        })
        .refine(isUUIDv7, { message: 'Invalid UUIDv7' })
        .transform((s) => s);
