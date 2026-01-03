/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Setting up test users with subscriptions...");

  const hashedPassword = await bcrypt.hash("Password123", 10);

  // Get subscription tier IDs
  const proTier = await prisma.subscriptionTier.findUnique({
    where: { name: "pro" },
  });

  const corporateTier = await prisma.subscriptionTier.findUnique({
    where: { name: "corporate" },
  });

  if (!proTier || !corporateTier) {
    throw new Error(
      "Subscription tiers not found. Please run the main seed first.",
    );
  }

  console.log(
    `  📦 Found tiers: pro=${proTier.id}, corporate=${corporateTier.id}`,
  );

  // 1. Update test@example.com to PRO tier
  console.log("  👤 Setting up test@example.com as PRO user...");
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {
      name: "Test User Pro",
    },
    create: {
      email: "test@example.com",
      name: "Test User Pro",
      passwordHash: hashedPassword,
      emailVerified: true,
    },
  });

  await prisma.userSubscription.upsert({
    where: { userId: testUser.id },
    update: {
      tierId: proTier.id,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
    create: {
      userId: testUser.id,
      tierId: proTier.id,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });
  console.log(`    ✅ test@example.com is now a PRO user`);

  // 2. Create test1@example.cojm as CORPORATE user
  console.log("  👤 Setting up test1@example.cojm as CORPORATE user...");
  const testUser2 = await prisma.user.upsert({
    where: { email: "test1@example.cojm" },
    update: {
      name: "Test User Corporate",
    },
    create: {
      email: "test1@example.cojm",
      name: "Test User Corporate",
      passwordHash: hashedPassword,
      emailVerified: true,
    },
  });

  await prisma.userSubscription.upsert({
    where: { userId: testUser2.id },
    update: {
      tierId: corporateTier.id,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
    create: {
      userId: testUser2.id,
      tierId: corporateTier.id,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });
  console.log(`    ✅ test1@example.cojm is now a CORPORATE user`);

  console.log("✅ Test users setup completed!");
  console.log("");
  console.log("📋 Test Credentials:");
  console.log("   test@example.com    - Password123 - PRO tier");
  console.log("   test1@example.cojm  - Password123 - CORPORATE tier");
}

main()
  .catch((e) => {
    console.error("❌ Setup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
