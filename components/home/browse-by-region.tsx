import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getCities() {
  const trucks = await prisma.coffeeTruck.groupBy({
    by: ["city"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return trucks.map((t) => ({
    city: t.city,
    count: t._count.id,
  }));
}

export async function BrowseByRegion() {
  const cities = await getCities();

  if (cities.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cities.map(({ city, count }) => (
          <Link
            key={city}
            href={`/trucks?city=${encodeURIComponent(city)}`}
            className="group"
          >
            <div className="border rounded-lg p-4 text-center hover:border-primary hover:bg-primary/5 transition-colors">
              <div className="font-semibold group-hover:text-primary">
                {city}
              </div>
              <div className="text-sm text-muted-foreground">{count} עגלות</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
