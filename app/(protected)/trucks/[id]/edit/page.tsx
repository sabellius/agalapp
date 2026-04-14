import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { TruckForm } from "@/components/trucks/truck-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEditWorkingHours, canModifyTruck } from "@/lib/truck-permissions";

export default async function EditTruckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;

  const truck = await prisma.coffeeTruck.findUnique({
    where: { id },
    include: {
      images: {
        select: {
          id: true,
          url: true,
          publicId: true,
          alt: true,
          isPrimary: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      hours: {
        orderBy: { dayOfWeek: "asc" },
      },
      attributes: {
        include: {
          attribute: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      },
      owner: {
        select: {
          id: true,
          tier: true,
          tierExpiryAt: true,
        },
      },
    },
  });

  if (!truck) {
    notFound();
  }

  if (!(await canModifyTruck(session?.user?.id ?? "", truck.ownerId))) {
    redirect("/trucks");
  }

  const canEditHours = canEditWorkingHours(truck.owner);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">עריכת עגלת קפה</h1>
      <TruckForm
        truck={truck}
        owner={truck.owner}
        hours={truck.hours}
        images={truck.images.map((img) => ({
          ...img,
          alt: img.alt || "",
        }))}
        attributes={truck.attributes.map((a) => a.attribute)}
        canEditHours={canEditHours}
      />
    </div>
  );
}
