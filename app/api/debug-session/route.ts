import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") ?? "";
  const hasSecurePrefix = cookieHeader.includes("__Secure-better-auth");
  const hasPlainCookie = cookieHeader.includes("better-auth.session_token");

  let sessionEmail = "NULL";
  try {
    const session = await auth.api.getSession({ headers: headersList });
    sessionEmail = session?.user?.email ?? "NULL";
  } catch (err) {
    sessionEmail = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({
    cookiePresent: cookieHeader.length > 0,
    cookieLength: cookieHeader.length,
    hasSecurePrefix,
    hasPlainCookie,
    xForwardedProto: headersList.get("x-forwarded-proto") ?? "NOT SET",
    sessionEmail,
  });
}
