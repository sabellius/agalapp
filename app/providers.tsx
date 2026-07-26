"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DirectionProvider } from "@/components/ui/direction";
import { TooltipProvider } from "@/components/ui/tooltip";

import { authClient } from "@/lib/auth-client";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      Link={Link}
      localization={{
        SIGN_IN: "כניסה",
        SIGN_IN_DESCRIPTION: "היכנס לחשבון שלך",
        SIGN_IN_ACTION: "כניסה",
        SIGN_IN_WITH: "התחבר באמצעות",
        SIGN_UP: "הרשמה",
        SIGN_UP_DESCRIPTION: "צור חשבון חדש",
        SIGN_UP_ACTION: "צור חשבון",
        SIGN_UP_EMAIL: "בדוק את האימייל שלך לקישור האימות",
        EMAIL: "אימייל",
        EMAIL_PLACEHOLDER: "הזן אימייל",
        EMAIL_REQUIRED: "אימייל נדרש",
        PASSWORD: "סיסמה",
        PASSWORD_PLACEHOLDER: "הזן סיסמה",
        PASSWORD_REQUIRED: "סיסמה נדרשת",
        CONFIRM_PASSWORD: "אימות סיסמה",
        CONFIRM_PASSWORD_PLACEHOLDER: "הזן סיסמה שוב",
        CONFIRM_PASSWORD_REQUIRED: "נדרש אימות סיסמה",
        NAME: "שם מלא",
        NAME_PLACEHOLDER: "שם מלא",
        CONTINUE: "המשך",
        FORGOT_PASSWORD: "שכחת סיסמה?",
        FORGOT_PASSWORD_LINK: "שכחת סיסמה?",
        FORGOT_PASSWORD_DESCRIPTION: "הזן את האימייל שלך לאיפוס סיסמה",
        FORGOT_PASSWORD_ACTION: "שלח קישור לאיפוס",
        FORGOT_PASSWORD_EMAIL: "בדוק את האימייל שלך לקישור איפוס הסיסמה",
        RESET_PASSWORD_ACTION: "שמור סיסמה חדשה",
        RESET_PASSWORD_DESCRIPTION: "הזן את הסיסמה החדשה שלך למטה",
        RESET_PASSWORD_SUCCESS: "הסיסמה אופסה בהצלחה",
        DONT_HAVE_AN_ACCOUNT: "אין לך חשבון?",
        ALREADY_HAVE_AN_ACCOUNT: "יש לך כבר חשבון?",
        INVALID_USERNAME_OR_PASSWORD: "אימייל או סיסמה שגויים",
        INVALID_EMAIL_OR_PASSWORD: "אימייל או סיסמה שגויים",
        EMAIL_IS_THE_SAME: "אימייל זה כבר קיים במערכת",
        INVALID_PASSWORD: "הסיסמה חלשה מדי",
        INVALID_EMAIL: "אימייל לא תקין",
        IS_REQUIRED: "שדה זה נדרש",
        PASSWORD_TOO_SHORT: "הסיסמה חייבת להכיל לפחות 8 תווים",
        PASSWORD_TOO_LONG: "הסיסמה ארוכה מדי",
        PASSWORDS_DO_NOT_MATCH: "הסיסמאות אינן תואמות",
        PASSWORD_COMPROMISED: "הסיסמה שהזנת נחשפה, בחר סיסמה אחרת",
        SIGN_OUT: "יציאה",
      }}
    >
      <TooltipProvider>
        <DirectionProvider dir="rtl">{children}</DirectionProvider>
      </TooltipProvider>
    </AuthUIProvider>
  );
}
