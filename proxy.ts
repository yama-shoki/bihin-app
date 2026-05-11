import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "user_id";

export function proxy(request: NextRequest) {
  const userId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/requests/:path*", "/admin/:path*"],
};
