import { headers } from "next/headers";
import { ZodError } from "zod";
import type { ActionResult } from "@/lib/actions";
import { auth } from "@/lib/auth";

export async function withAuth<T>(
  handler: (userId: string) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, message: "אינך מחובר" };
  }
  return handler(session.user.id);
}

export async function safeAction<T>(
  fn: () => Promise<ActionResult<T>>,
  errorMessage = "שגיאה כללית",
): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Action error:", error);
    return { success: false, message: errorMessage };
  }
}
