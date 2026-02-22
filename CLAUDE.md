# Claude Code Context - AgalApp

@AGENTS.md

## Code Patterns

### Server Actions

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function actionName(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  // ... do work ...

  revalidatePath("/path");
  return { success: true, data };
}
```

### Prisma Client

```typescript
import { prisma } from "@/lib/prisma";
// Uses MariaDB adapter, not standard connection
```

### Auth Check

```typescript
// Server-side
import { auth } from "@/lib/auth";
const session = await auth.api.getSession({ headers: await headers() });

// Client-side
import { authClient } from "@/lib/auth-client";
await authClient.signIn.email({ email, password });
```

## When Working Here

1. No `any` types — TypeScript strict throughout
2. Server Components by default, `"use client"` only when needed
3. All mutations go in `app/actions/` as Server Actions
4. Always call `revalidatePath()` after data mutations
5. Hebrew text for UI labels, English for all code and comments
6. Always verify role-based access in protected Server Actions
