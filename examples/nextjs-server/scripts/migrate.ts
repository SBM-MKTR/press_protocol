import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { getDb } from "../lib/db/client";
import { createId } from "../lib/db/ids";
import { schemaMigrations } from "../lib/db/schema";

async function main() {
    const db = getDb();
    const migrationsDir = path.join(process.cwd(), "db", "migrations");
    const files = (await readdir(migrationsDir))
        .filter((file) => file.endsWith(".sql"))
        .sort();

    await db.execute(sql.raw(`
        create table if not exists press_migrations (
            id text primary key,
            name text not null unique,
            executed_at timestamptz not null default now()
        )
    `));

    const applied = await db.select({ name: schemaMigrations.name }).from(schemaMigrations);
    const appliedNames = new Set(applied.map((migration) => migration.name));

    for (const file of files) {
        if (appliedNames.has(file)) continue;

        const fullPath = path.join(migrationsDir, file);
        const raw = await readFile(fullPath, "utf8");
        const statements = raw
            .split("--> statement-breakpoint")
            .map((statement) => statement.trim())
            .filter((statement) => statement.length > 0);

        for (const statement of statements) {
            await db.execute(sql.raw(statement));
        }

        await db.insert(schemaMigrations).values({
            id: createId("mig"),
            name: file,
            executedAt: new Date(),
        } as any);

        console.log(`Applied migration ${file}`);
    }

    if (files.length === 0) {
        console.log("No migration files found.");
        return;
    }

    console.log("Migrations complete.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
