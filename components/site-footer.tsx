import { APP_SHORT_SHA, APP_VERSION } from "@/lib/version";

export function SiteFooter() {
  return (
    <footer className="hidden py-4 text-center text-xs text-muted-foreground md:block">
      v{APP_VERSION} · {APP_SHORT_SHA}
    </footer>
  );
}
