import { RequestError } from './errors.js';

const UUIDV7_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function isUUIDv7(x: unknown): x is UUIDv7 {
    return typeof x === 'string' && UUIDV7_REGEX.test(x);
}

export function assertUUIDv7(x: unknown): asserts x is UUIDv7 {
    if (!isUUIDv7(x)) {
        throw new RequestError(`Invalid UUIDv7: ${String(x)}`);
    }
}

export type UUIDv7 = `${string}-${string}-${string}-${string}-${string}`;
