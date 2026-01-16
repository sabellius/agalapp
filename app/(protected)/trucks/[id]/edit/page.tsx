import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { TruckForm } from "@/components/trucks/truck-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditTruckPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;

  const truck = await prisma.coffeeTruck.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      city: true,
      address: true,
      ownerId: true,
    },
  });

  if (!truck) {
    notFound();
  }

  if (truck.ownerId !== session.user.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      redirect("/trucks");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">עריכת עגלת קפה</h1>
      <TruckForm truck={truck} />
    </div>
  );
}
