"use server";

import { eq } from "drizzle-orm";
import type { Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import type { User } from "@/db/types";

const SESSION_COOKIE_NAME = "user_id";
const ADMIN_REQUESTS_PATH = "/admin/requests" as Route;
const EMPLOYEE_REQUESTS_PATH = "/requests" as Route;

export async function loginAs(userId: User["id"]): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    redirect("/");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect(
    user.role === "admin" ? ADMIN_REQUESTS_PATH : EMPLOYEE_REQUESTS_PATH,
  );
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/");
}
