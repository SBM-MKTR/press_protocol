import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getServerEnv } from "../env";
import * as schema from "./schema";

type PressDb = ReturnType<typeof drizzle<typeof schema>>;

declare global {
    // eslint-disable-next-line no-var
    var __pressDb__: PressDb | undefined;
}

export function getDb(): PressDb {
    if (globalThis.__pressDb__) {
        return globalThis.__pressDb__;
    }

    const env = getServerEnv();
    const sql = neon(env.databaseUrl);
    const db = drizzle(sql, { schema });
    globalThis.__pressDb__ = db;
    return db;
}

export { schema };
