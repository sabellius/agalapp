import { fakerHE as faker } from "@faker-js/faker";
import { prisma } from "@/lib/prisma";
import { Role } from "../generated/prisma/client";

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.review.deleteMany();
  await prisma.coffeeTruckImage.deleteMany();
  await prisma.coffeeTruck.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("👥 Creating users...");
  const users = await Promise.all([
    // Regular users
    ...Array.from({ length: 8 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: `user${i + 1}@example.com`,
          role: Role.USER,
          emailVerified: true,
        },
      }),
    ),
    // Truck owners
    ...Array.from({ length: 4 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: `owner${i + 1}@example.com`,
          role: Role.TRUCK_OWNER,
          emailVerified: true,
        },
      }),
    ),
    // Admin
    prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: "admin@example.com",
        role: Role.ADMIN,
        emailVerified: true,
      },
    }),
  ]);

  const truckOwners = users.slice(8, 12);
  const regularUsers = users.slice(0, 8);

  // Create coffee trucks
  console.log("☕ Creating coffee trucks...");
  const trucks = await Promise.all(
    truckOwners.map((owner, i) =>
      prisma.coffeeTruck.create({
        data: {
          name: `Coffee Truck ${faker.company.name()}`,
          city: faker.location.city(),
          address: faker.location.streetAddress(true),
          latitude: faker.location.latitude({ min: 31.0, max: 33.0 }),
          longitude: faker.location.longitude({ min: 34.0, max: 36.0 }),
          ownerId: owner.id,
        },
      }),
    ),
  );

  // Create images for trucks
  console.log("📸 Creating truck images...");
  for (const truck of trucks) {
    const imageCount = faker.number.int({ min: 3, max: 6 });
    await Promise.all(
      Array.from({ length: imageCount }).map((_, i) =>
        prisma.coffeeTruckImage.create({
          data: {
            truckId: truck.id,
            url: faker.image.url({
              width: 800,
              height: 600,
            }),
            publicId: `coffee_truck_${truck.id}_${i}`,
            alt: `${truck.name} - Photo ${i + 1}`,
            isPrimary: i === 0,
          },
        }),
      ),
    );
  }

  // Create reviews
  console.log("⭐ Creating reviews...");
  const reviewPromises: Promise<unknown>[] = [];

  for (const user of regularUsers) {
    for (const truck of trucks) {
      // Each user reviews 1-3 trucks
      const reviewCount = faker.number.int({ min: 1, max: 3 });
      for (let i = 0; i < reviewCount; i++) {
        reviewPromises.push(
          prisma.review.create({
            data: {
              rating: faker.number.int({ min: 3, max: 5 }),
              content: faker.lorem.paragraphs(2),
              truckId: truck.id,
              userId: user.id,
            },
          }),
        );
      }
    }
  }

  await Promise.all(reviewPromises);

  console.log("✅ Seed completed successfully!");
  console.log(`📊 Created ${users.length} users`);
  console.log(`🚚 Created ${trucks.length} coffee trucks`);
  console.log(`📸 Created ${trucks.length * 4.5} truck images (average)`);
  console.log(`⭐ Created ${regularUsers.length * 2 * 4.5} reviews (average)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("👋 Disconnected from database");
  });
