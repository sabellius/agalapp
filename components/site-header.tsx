"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const mainNav = [
  { title: "בית", href: "/" },
  { title: "עגלות קפה", href: "/trucks" },
];

const authenticatedNav = [{ title: "לוח בקרה", href: "/dashboard" }];

const ownerNav = [{ title: "הוסף עגלה", href: "/trucks/new" }];

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  isMobile?: boolean;
}

function NavLink({ href, children, onClick, isMobile = false }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "font-medium transition-colors hover:text-primary text-foreground/80 block",
        isMobile
          ? "text-base py-3 px-6 hover:bg-accent hover:text-accent-foreground"
          : "text-sm",
      )}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const user = session?.user as
    | { name?: string | null; email?: string | null; role?: string }
    | null
    | undefined;
  const isAuthenticated = !!user;
  const isOwner = user?.role === "TRUCK_OWNER" || user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <MenuIcon className="size-5" />
              <span className="sr-only">תפריט</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64" showCloseButton={false}>
            <SheetTitle className="sr-only">תפריט ניווט</SheetTitle>
            <nav className="flex flex-col mt-6">
              {mainNav.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  isMobile
                >
                  {item.title}
                </NavLink>
              ))}
              {isAuthenticated &&
                authenticatedNav.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    isMobile
                  >
                    {item.title}
                  </NavLink>
                ))}
              {isOwner &&
                ownerNav.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    isMobile
                  >
                    {item.title}
                  </NavLink>
                ))}
            </nav>
          </SheetContent>
        </Sheet>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="text-lg font-bold">
            אגלאפ
          </Link>
          {mainNav.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.title}
            </NavLink>
          ))}
          {isAuthenticated &&
            authenticatedNav.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.title}
              </NavLink>
            ))}
          {isOwner &&
            ownerNav.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.title}
              </NavLink>
            ))}
        </nav>

        <div className="me-auto flex flex-1 items-center justify-end gap-2">
          {!isPending &&
            (isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {user?.name?.[0] || user?.email?.[0] || "U"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || "משתמש"}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">לוח בקרה</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      authClient.signOut({
                        fetchOptions: { credentials: "include" },
                      })
                    }
                  >
                    התנתק
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/sign-in">התחברות</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">הרשמה</Link>
                </Button>
              </div>
            ))}
        </div>
      </div>
    </header>
  );
}
