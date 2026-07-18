import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  console.log("[DEBUG] cookie header:", headersList.get("cookie"));
  const session = await auth.api.getSession({ headers: headersList });
  console.log("[DEBUG] session:", session?.user?.email ?? "NULL");

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return <>{children}</>;
}
