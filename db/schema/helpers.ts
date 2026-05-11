import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

// * casing: "snake_case" 前提。TS camelCase を渡すと DB 側で snake_case に自動変換される

export const id = text()
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID());

export const timestamps = {
  createdAt: integer({ mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer({ mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
};
