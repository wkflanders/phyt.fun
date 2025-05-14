import { eq } from 'drizzle-orm';

import {
    UUIDv7,
    User,
    CreateUserInput,
    UserRecord,
    Transaction,
    CardWithMetadata
} from '@phyt/types';

// eslint-disable-next-line no-restricted-imports
import { DrizzleDB } from '../db.js';
// eslint-disable-next-line no-restricted-imports
import { users } from '../schema.js';

const toUser = (userRow: typeof users.$inferSelect): User => ({
    ...userRow,
    createdAt: new Date(userRow.createdAt),
    updatedAt: new Date(userRow.updatedAt)
});

export const userOps = (db: DrizzleDB) => {};
