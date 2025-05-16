import { z } from 'zod';

import { RequestError } from './errors.js';

import type { ISODate, UUIDv7 } from '@phyt/types';

const UUIDV7_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const DefaultAvatar =
    'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut';

export function isUUIDv7(x: unknown): x is UUIDv7 {
    return typeof x === 'string' && UUIDV7_REGEX.test(x);
}

export function assertUUIDv7(x: unknown): asserts x is UUIDv7 {
    if (!isUUIDv7(x)) {
        throw new RequestError(`Invalid UUIDv7: ${String(x)}`);
    }
}

export const Iso = () => z.string().datetime() as unknown as z.ZodType<ISODate>;
