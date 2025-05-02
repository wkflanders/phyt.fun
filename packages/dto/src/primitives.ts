import { isUUIDv7 } from '@phyt/models';
import { z } from 'zod';

export const uuidv7 = () =>
    z
        .string()
        .refine(isUUIDv7, { message: 'Invalid UUIDv7' })
        .transform((s) => s);
