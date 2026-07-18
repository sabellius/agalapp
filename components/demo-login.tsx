"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const DEMO_PASSWORD = "password123";

const DEMO_ACCOUNTS = [
  {
    label: "משתמש",
    description: "עיון וביקורות",
    email: "test-user-free@example.com",
  },
  {
    label: "בעל עגלה",
    description: "ניהול עגלות",
    email: "test-owner-premium@example.com",
  },
  { label: "מנהל", description: "גישה מלאה", email: "test-admin@example.com" },
];

export function DemoLogin() {
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  async function handleDemoLogin(email: string) {
    setLoadingEmail(email);
    const { error } = await authClient.signIn.email({
      email,
      password: DEMO_PASSWORD,
    });
    if (error) {
      setLoadingEmail(null);
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-center text-xs text-muted-foreground">
        חשבונות דמו לבדיקה מהירה
      </p>
      <div className="flex flex-col gap-2">
        {DEMO_ACCOUNTS.map((account) => (
          <Button
            key={account.email}
            variant="outline"
            size="sm"
            disabled={loadingEmail !== null}
            onClick={() => handleDemoLogin(account.email)}
            className="justify-between"
          >
            {loadingEmail === account.email ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>כניסה כ{account.label}</span>
                <span className="text-xs text-muted-foreground">
                  {account.description}
                </span>
              </>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
