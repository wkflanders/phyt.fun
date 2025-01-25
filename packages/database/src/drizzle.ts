import { drizzle } from "drizzle-orm/neon-http";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import * as schema from './schema';
import { config } from "dotenv";

config({ path: "../../.env" });

const sql: NeonQueryFunction<boolean, boolean> = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

