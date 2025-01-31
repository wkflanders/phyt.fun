import { db } from './drizzle';
import { seed } from "drizzle-seed";
import * as schema from './schema';

async function main() {
    await seed(db, schema);
}

main();