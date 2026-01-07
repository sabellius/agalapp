"use client";

import { useSession } from "@/lib/auth-client";
import { SignOut } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="container mx-auto max-w-md py-12">
        <p className="text-center">טוען.</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto max-w-md py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">לא מחובר</h1>
          <p>עליך להתחבר כדי לגשת לדף זה</p>
          <Link
            href="/auth/sign-in"
            className="inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            התחברות
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">ברוכים הבאים!</h1>
          <p className="text-muted-foreground">
            {session.user.name || session.user.email}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-lg font-semibold">פרטי משתמש</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium">אימייל:</dt>
              <dd className="text-muted-foreground">{session.user.email}</dd>
            </div>
            {session.user.name && (
              <div>
                <dt className="font-medium">שם:</dt>
                <dd className="text-muted-foreground">{session.user.name}</dd>
              </div>
            )}
            {session.user.image && (
              <div>
                <dt className="font-medium">תמונה:</dt>
                <dd>
                  <Image
                    src={session.user.image}
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

        {/* <div className="flex flex-col gap-4">
          <SignOut redirectTo="/" />
        </div> */}

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
