import "server-only";
import { cache } from "react";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import type { UserRow } from "@/db/types";

export const listSeedUsers = cache(async (): Promise<UserRow[]> => {
  return db.select().from(users).orderBy(users.name);
});
