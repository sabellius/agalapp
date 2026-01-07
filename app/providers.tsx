"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => {
        // Clear router cache (protected routes)
        router.refresh();
      }}
      Link={Link}
      localization={{
        SIGN_IN: "התחברות",
        SIGN_IN_DESCRIPTION: "התחבר לחשבון שלך",
        EMAIL: "אימייל",
        PASSWORD: "סיסמה",
        CONTINUE: "המשך",
        SIGN_UP: "הרשמה",
        SIGN_UP_DESCRIPTION: "צור חשבון חדש",
        FORGOT_PASSWORD: "שכחת סיסמה?",
        DONT_HAVE_AN_ACCOUNT: "אין לך חשבון?",
        FORGOT_PASSWORD_ACTION: "אפס סיסמה",
        FORGOT_PASSWORD_LINK: "שכחת סיסמה?",
        NAME: "שם מלא",
        ALREADY_HAVE_AN_ACCOUNT: "יש לך כבר חשבון?",
        INVALID_USERNAME_OR_PASSWORD: "אימייל או סיסמה שגויים",
        EMAIL_IS_THE_SAME: "אימייל זה כבר קיים במערכת",
        INVALID_PASSWORD: "הסיסמה חלשה מדי",
        INVALID_EMAIL: "אימייל לא תקין",
        IS_REQUIRED: "שדה זה נדרש",
        PASSWORD_TOO_SHORT: "הסיסמה חייבת להכיל לפחות 8 תווים",
      }}
    >
      {children}
    </AuthUIProvider>
  );
}
