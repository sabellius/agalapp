import { fakerHE as faker } from "@faker-js/faker";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, UserTier } from "../generated/prisma/client";

const TEST_PASSWORD = "password123";

const TEST_USERS = [
  {
    email: "test-user-free@example.com",
    role: Role.USER,
    tier: UserTier.FREE,
    name: "Test User Free",
  },
  {
    email: "test-user-premium@example.com",
    role: Role.USER,
    tier: UserTier.PREMIUM,
    name: "Test User Premium",
  },
  {
    email: "test-owner-free@example.com",
    role: Role.TRUCK_OWNER,
    tier: UserTier.FREE,
    name: "Test Owner Free",
  },
  {
    email: "test-owner-premium@example.com",
    role: Role.TRUCK_OWNER,
    tier: UserTier.PREMIUM,
    name: "Test Owner Premium",
  },
  {
    email: "test-admin@example.com",
    role: Role.ADMIN,
    tier: UserTier.FREE,
    name: "Test Admin",
  },
];

async function main() {
  console.log("🌱 Starting database seed...");
  console.log(
    "🔐 Using better-auth sign-up API to create users (ensures correct password hashing)",
  );

  console.log("🗑️  Clearing existing data...");
  await prisma.truckAttributeAssignment.deleteMany();
  await prisma.truckAttribute.deleteMany();
  await prisma.review.deleteMany();
  await prisma.coffeeTruckImage.deleteMany();
  await prisma.coffeeTruck.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("👥 Creating test users (for dev + E2E)...");
  const testUserPromises = TEST_USERS.map((u) =>
    auth.api
      .signUpEmail({
        body: {
          email: u.email,
          password: TEST_PASSWORD,
          name: u.name,
        },
      })
      .then(() => prisma.user.findUnique({ where: { email: u.email } })),
  );

  const testUsers = (await Promise.all(testUserPromises)).filter(
    (user): user is NonNullable<typeof user> => user !== null,
  );

  console.log("👥 Creating random users for volume...");
  const randomUserPromises = [
    ...Array.from({ length: 6 }).map((_, i) =>
      auth.api
        .signUpEmail({
          body: {
            email: `user${i + 1}@example.com`,
            password: TEST_PASSWORD,
            name: faker.person.fullName(),
          },
        })
        .then(() =>
          prisma.user.findUnique({
            where: { email: `user${i + 1}@example.com` },
          }),
        ),
    ),
    ...Array.from({ length: 3 }).map((_, i) =>
      auth.api
        .signUpEmail({
          body: {
            email: `owner${i + 1}@example.com`,
            password: TEST_PASSWORD,
            name: faker.person.fullName(),
          },
        })
        .then(() =>
          prisma.user.findUnique({
            where: { email: `owner${i + 1}@example.com` },
          }),
        ),
    ),
  ];

  const randomUsers = (await Promise.all(randomUserPromises)).filter(
    (user): user is NonNullable<typeof user> => user !== null,
  );

  const allUsers = [...testUsers, ...randomUsers];

  console.log("🔐 Updating user roles and tiers...");
  const testOwnerPremium = testUsers.find(
    (u) => u.email === "test-owner-premium@example.com",
  );
  const testOwnerFree = testUsers.find(
    (u) => u.email === "test-owner-free@example.com",
  );
  const randomOwners = randomUsers.filter((u) => u?.email.startsWith("owner"));
  const truckOwners = [testOwnerFree, testOwnerPremium, ...randomOwners].filter(
    (u): u is NonNullable<typeof u> => u !== undefined,
  );

  const testUserPremium = testUsers.find(
    (u) => u.email === "test-user-premium@example.com",
  );
  const testUserFree = testUsers.find(
    (u) => u.email === "test-user-free@example.com",
  );
  const randomRegularUsers = randomUsers.filter((u) =>
    u?.email.startsWith("user"),
  );
  const regularUsers = [
    testUserFree,
    testUserPremium,
    ...randomRegularUsers,
  ].filter((u): u is NonNullable<typeof u> => u !== undefined);

  await Promise.all([
    ...testUsers.map((user) => {
      const config = TEST_USERS.find((u) => u.email === user.email);
      if (!config) return Promise.resolve();
      const tierExpiryAt =
        config.tier === UserTier.PREMIUM
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null;
      return prisma.user.update({
        where: { id: user.id },
        data: { role: config.role, tier: config.tier, tierExpiryAt },
      });
    }),
    ...randomRegularUsers.map((user) =>
      prisma.user.update({
        where: { id: user.id },
        data: { role: Role.USER, tier: UserTier.FREE },
      }),
    ),
    ...randomOwners.map((user) =>
      prisma.user.update({
        where: { id: user.id },
        data: { role: Role.TRUCK_OWNER, tier: UserTier.FREE },
      }),
    ),
  ]);

  console.log("🏷️  Creating predefined truck attributes...");
  await prisma.truckAttribute.createMany({
    data: [
      {
        name: "נגיש",
        nameEn: "Accessible",
        icon: "accessibility",
        sortOrder: 1,
      },
      {
        name: "ישיבה בחוץ",
        nameEn: "Outdoor Seating",
        icon: "sun",
        sortOrder: 10,
      },
      { name: "מזגן", nameEn: "AC", icon: "wind", sortOrder: 11 },
      { name: "חימום", nameEn: "Heated", icon: "flame", sortOrder: 12 },
      { name: "WiFi", nameEn: "WiFi", icon: "wifi", sortOrder: 20 },
      { name: "שירותים", nameEn: "Restrooms", icon: "doorOpen", sortOrder: 21 },
      {
        name: "אשראי",
        nameEn: "Credit Card",
        icon: "creditCard",
        sortOrder: 30,
      },
      { name: "ביט", nameEn: "Bit", icon: "smartphone", sortOrder: 31 },
      { name: "טבעוני", nameEn: "Vegan", icon: "leaf", sortOrder: 40 },
      {
        name: "ללא גלוטן",
        nameEn: "Gluten Free",
        icon: "wheatOff",
        sortOrder: 41,
      },
      { name: "חלבי", nameEn: "Dairy", icon: "milk", sortOrder: 42 },
      { name: "מתוקים", nameEn: "Desserts", icon: "cakeSlice", sortOrder: 50 },
      { name: "מאפים", nameEn: "Pastries", icon: "croissant", sortOrder: 51 },
      { name: "כריכים", nameEn: "Sandwiches", icon: "sandwich", sortOrder: 52 },
      { name: "משלוחים", nameEn: "Delivery", icon: "truck", sortOrder: 60 },
      { name: "איסוף", nameEn: "Takeaway", icon: "shoppingBag", sortOrder: 61 },
      {
        name: "ידידותי לכלבים",
        nameEn: "Dog Friendly",
        icon: "dog",
        sortOrder: 70,
      },
      {
        name: "ידידותי לילדים",
        nameEn: "Kid Friendly",
        icon: "baby",
        sortOrder: 71,
      },
    ],
  });

  console.log("☕ Creating coffee trucks...");
  const trucks = await Promise.all(
    truckOwners.map((owner) =>
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
            url: faker.image.url({ width: 800, height: 600 }),
            publicId: `coffee_truck_${truck.id}_${i}`,
            alt: `${truck.name} - Photo ${i + 1}`,
            isPrimary: i === 0,
          },
        }),
      ),
    );
  }

  console.log("🕐 Creating truck hours (Israeli patterns)...");
  const israeliHourPatterns = [
    {
      name: "morning",
      days: [0, 1, 2, 3, 4],
      open: "06:30",
      close: "14:00",
      friOpen: "06:30",
      friClose: "12:00",
      satClosed: true,
    },
    {
      name: "morning-long",
      days: [0, 1, 2, 3, 4],
      open: "07:00",
      close: "16:00",
      friOpen: "07:00",
      friClose: "13:00",
      satClosed: true,
    },
    {
      name: "evening",
      days: [0, 1, 2, 3, 4],
      open: "16:00",
      close: "23:00",
      friOpen: "16:00",
      friClose: "15:00",
      satOpen: "18:00",
      satClose: "23:00",
    },
    {
      name: "all-day",
      days: [0, 1, 2, 3, 4],
      open: "07:00",
      close: "19:00",
      friOpen: "07:00",
      friClose: "14:00",
      satClosed: true,
    },
    {
      name: "late-morning",
      days: [0, 1, 2, 3, 4, 5],
      open: "09:00",
      close: "17:00",
      friOpen: "09:00",
      friClose: "14:00",
      satOpen: "10:00",
      satClose: "15:00",
    },
    {
      name: "weekend-focused",
      days: [0, 1, 2, 3],
      open: "08:00",
      close: "15:00",
      friOpen: "08:00",
      friClose: "15:00",
      satOpen: "09:00",
      satClose: "16:00",
    },
  ];

  for (const truck of trucks) {
    const pattern = faker.helpers.arrayElement(israeliHourPatterns);

    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
      let openTime: string | null = null;
      let closeTime: string | null = null;
      let isClosed = false;

      if (dayOfWeek === 5) {
        openTime = pattern.friOpen;
        closeTime = pattern.friClose;
      } else if (dayOfWeek === 6) {
        if ("satClosed" in pattern && pattern.satClosed) {
          isClosed = true;
        } else if (
          "satOpen" in pattern &&
          pattern.satOpen &&
          pattern.satClose
        ) {
          openTime = pattern.satOpen;
          closeTime = pattern.satClose;
        } else {
          isClosed = true;
        }
      } else if (pattern.days.includes(dayOfWeek)) {
        openTime = pattern.open;
        closeTime = pattern.close;
      } else {
        isClosed = true;
      }

      await prisma.truckHours.create({
        data: {
          truckId: truck.id,
          dayOfWeek,
          openTime,
          closeTime,
          isClosed,
        },
      });
    }
  }

  console.log("⭐ Creating reviews...");
  const reviewPromises: Promise<unknown>[] = [];
  const usedUserTruckPairs = new Set<string>();

  for (const user of regularUsers) {
    for (const truck of trucks) {
      const pairKey = `${user.id}-${truck.id}`;
      if (usedUserTruckPairs.has(pairKey)) continue;
      usedUserTruckPairs.add(pairKey);

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

  await Promise.all(reviewPromises);

  console.log("✅ Seed completed successfully!");
  console.log(`📊 Created ${allUsers.length} users`);
  console.log(`🚚 Created ${trucks.length} coffee trucks`);
  console.log("\n🔐 Test Credentials (password for all: password123):");
  console.log("────────────────────────────────────────────────────────────");
  console.log("Test Users (for E2E + dev):");
  for (const u of TEST_USERS)
    console.log(`   ${u.email} (${u.role}, ${u.tier})`);
  console.log("\nRandom Users (for dev volume):");
  for (const u of randomRegularUsers) console.log(`   ${u.email} (USER, FREE)`);
  for (const u of randomOwners)
    console.log(`   ${u.email} (TRUCK_OWNER, FREE)`);
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
