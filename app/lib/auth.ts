import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import type { UserRole } from "@/db/schema/users";
import { users } from "@/db/schema/users";
import type { User } from "@/db/types";
import "server-only";

const SESSION_COOKIE_NAME = "user_id";

export const getSession = cache(async (): Promise<{ user: User } | null> => {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!userId) {
    return null;
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user ? { user } : null;
});

export async function requireSession(): Promise<{ user: User }> {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }
  return session;
}

export async function requireRole(role: UserRole): Promise<{ user: User }> {
  const session = await requireSession();
  if (session.user.role !== role) {
    forbidden();
  }
  return session;
}

export function canViewPurchaseRequest(
  viewer: User,
  ownerUserId: User["id"],
): boolean {
  return viewer.role === "admin" || viewer.id === ownerUserId;
}

export function canReviewPurchaseRequest(viewer: User): boolean {
  return viewer.role === "admin";
}
