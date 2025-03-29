import { seed } from 'drizzle-seed';

import { db } from './drizzle';
import * as schema from './schema';

async function main() {
    await seed(db, schema);
}

main().catch(console.error);
