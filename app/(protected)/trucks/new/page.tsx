import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TruckForm } from "@/components/trucks/truck-form";
import { auth } from "@/lib/auth";
import { canCreateTruck, getUserRole } from "@/lib/truck-permissions";

export default async function NewTruckPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = await getUserRole(session?.user?.id ?? "");

  if (!canCreateTruck(role)) {
    redirect("/trucks");
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <TruckForm />
    </div>
  );
}
