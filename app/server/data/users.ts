import "server-only";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import type { UserRow } from "@/db/types";

export async function listSeedUsers(): Promise<UserRow[]> {
  return db.select().from(users).orderBy(users.name);
}
