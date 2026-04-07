import { Plus } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">ברוכים הבאים!</h1>
          <p className="text-muted-foreground">{user?.name || user?.email}</p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-semibold">ניהול עגלות</h2>
          <div className="space-y-3">
            <Link
              href="/trucks/new"
              className="flex items-center justify-between rounded-md border p-4 hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-medium">הוספת עגלת קפה חדשה</p>
                <p className="text-sm text-muted-foreground">
                  הוסף את עגלת הקפה שלך
                </p>
              </div>
              <Plus className="h-6 w-6" />
            </Link>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-lg font-semibold">פרטי משתמש</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium">אימייל:</dt>
              <dd className="text-muted-foreground">{user?.email}</dd>
            </div>
            {user?.name && (
              <div>
                <dt className="font-medium">שם:</dt>
                <dd className="text-muted-foreground">{user.name}</dd>
              </div>
            )}
            {user?.image && (
              <div>
                <dt className="font-medium">תמונה:</dt>
                <dd>
                  <Image
                    src={user.image}
                    alt="תמונה"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </dd>
              </div>
            )}
          </dl>
        </div>

        <SignOutButton />

        <Link
          href="/"
          className="block text-center text-sm text-muted-foreground hover:underline"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
