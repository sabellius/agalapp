import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import { DemoLogin } from "@/components/demo-login";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <section className="container mx-auto flex grow flex-col items-center justify-center p-4 md:p-6">
      <AuthView
        path={path}
        redirectTo="/dashboard"
        cardFooter={path === "sign-in" ? <DemoLogin /> : undefined}
      />
    </section>
  );
}
