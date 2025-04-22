import { db, runners, users, eq } from '@phyt/database';

import type { Runner } from '@phyt/types';

export const metadataRepository = {
    findAllRunners: async (): Promise<Runner[]> => {
        return db.select().from(runners).execute();
    },

    findRunnerById: async (runnerId: number): Promise<Runner | null> => {
        const [row] = await db
            .select()
            .from(runners)
            .where(eq(runners.id, runnerId))
            .limit(1)
            .execute();
        return row ?? null;
    },

    findUsernameByUserId: async (userId: number): Promise<string> => {
        const [row] = await db
            .select({ username: users.username })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)
            .execute();
        return row.username;
    }
};
