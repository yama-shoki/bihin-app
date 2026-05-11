import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { USER_ROLES } from "../constants/user-role";
import { id, timestamps } from "./helpers";

export const users = sqliteTable("users", {
  id,
  name: text().notNull(),
  department: text().notNull(),
  role: text({ enum: USER_ROLES }).notNull(),
  ...timestamps,
});
