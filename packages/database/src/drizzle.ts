import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { config } from "dotenv";

config({ path: "./env" });

const sql = neon(process.env.DATABASE_URL!);
export const db: PostgresJsDatabase<typeof schema> = drizzle(sql, { schema });