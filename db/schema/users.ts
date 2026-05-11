import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./helpers";

export const USER_ROLES = ["admin", "employee"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const users = sqliteTable("users", {
  id,
  name: text().notNull(),
  department: text().notNull(),
  role: text({ enum: USER_ROLES }).notNull(),
  ...timestamps,
});
