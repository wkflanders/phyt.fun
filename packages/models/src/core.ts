import { RequestError } from '@phyt/infra';

import type { UUIDv7 } from '@phyt/types';

const UUIDV7_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// const PRIVY_DID_REGEX = /^did:privy:[a-zA-Z0-9._-]+$/;

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

// export function isPrivyId(x: unknown): x is PrivyId {
//     return typeof x === 'string' && PRIVY_DID_REGEX.test(x);
// }

// export function assertPrivyId(x: unknown): asserts x is PrivyId {
//     if (!isPrivyId(x)) {
//         throw new RequestError(`Invalid Privy DID: ${String(x)}`);
//     }
// }
