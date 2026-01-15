import { fakerHE as faker } from "@faker-js/faker";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "../generated/prisma/client";

async function main() {
  console.log("🌱 Starting database seed...");
  console.log(
    "🔐 Using better-auth sign-up API to create users (ensures correct password hashing)",
  );

  console.log("🗑️  Clearing existing data...");
  await prisma.review.deleteMany();
  await prisma.coffeeTruckImage.deleteMany();
  await prisma.coffeeTruck.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("👥 Creating users via better-auth sign-up...");
  const TEST_PASSWORD = "password123";

  const userPromises = [
    // Regular users
    ...Array.from({ length: 8 }).map((_, i) =>
      auth.api
        .signUpEmail({
          body: {
            email: `user${i + 1}@example.com`,
            password: TEST_PASSWORD,
            name: faker.person.fullName(),
          },
        })
        .then((_) =>
          prisma.user.findUnique({
            where: { email: `user${i + 1}@example.com` },
          }),
        ),
    ),
    // Truck owners
    ...Array.from({ length: 4 }).map((_, i) =>
      auth.api
        .signUpEmail({
          body: {
            email: `owner${i + 1}@example.com`,
            password: TEST_PASSWORD,
            name: faker.person.fullName(),
          },
        })
        .then((_) =>
          prisma.user.findUnique({
            where: { email: `owner${i + 1}@example.com` },
          }),
        ),
    ),
    // Admin
    auth.api
      .signUpEmail({
        body: {
          email: "admin@example.com",
          password: TEST_PASSWORD,
          name: faker.person.fullName(),
        },
      })
      .then((_) =>
        prisma.user.findUnique({
          where: { email: "admin@example.com" },
        }),
      ),
  ];

  const users = (await Promise.all(userPromises)).filter(
    (user): user is NonNullable<typeof user> => user !== null,
  );

  const truckOwners = users.slice(8, 12);
  const regularUsers = users.slice(0, 8);

  console.log("🔐 Updating user roles...");
  await Promise.all([
    ...regularUsers.map((user) =>
      prisma.user.update({
        where: { id: user.id },
        data: { role: Role.USER },
      }),
    ),
    ...truckOwners.map((user) =>
      prisma.user.update({
        where: { id: user.id },
        data: { role: Role.TRUCK_OWNER },
      }),
    ),
    prisma.user.update({
      where: { id: users[12].id },
      data: { role: Role.ADMIN },
    }),
  ]);

  console.log("☕ Creating coffee trucks...");
  const trucks = await Promise.all(
    truckOwners.map((owner, _i) =>
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

  console.log("⭐ Creating reviews...");
  const reviewPromises: Promise<unknown>[] = [];

  for (const user of regularUsers) {
    for (const truck of trucks) {
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
  console.log("\n🔐 Test Credentials:");
  console.log("────────────────────────────────────────────────────────────");
  console.log("All accounts use the same password:");
  console.log(`   Password: ${TEST_PASSWORD}`);
  console.log("\nRegular Users:");
  regularUsers.forEach((user, i) => {
    console.log(`   ${i + 1}. ${user.email}`);
  });
  console.log("\nTruck Owners:");
  truckOwners.forEach((owner, i) => {
    console.log(`   ${i + 1}. ${owner.email}`);
  });
  console.log("\nAdmin:");
  console.log(`   1. ${users[12].email}`);
  console.log("────────────────────────────────────────────────────────────");
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
