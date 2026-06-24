import bcrypt from "bcryptjs";
import { AppRole, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to database...");
  await prisma.$connect();

  const adminAccounts = [
    { email: "admin@autocare.ai", name: "Admin" },
    { email: "admin1@autocare.ai", name: "Admin One" },
    { email: "admin2@autocare.ai", name: "Admin Two" },
    { email: "admin3@autocare.ai", name: "Admin Three" },
    { email: "admin4@autocare.ai", name: "Admin Four" },
  ];
  const defaultPassword = "ChangeMe123!";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  for (const account of adminAccounts) {
    const adminUser = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        phone: "",
        avatarUrl: "",
        passwordHash,
        role: AppRole.admin,
        planName: "admin",
        subscription: "active",
      },
      create: {
        name: account.name,
        email: account.email,
        phone: "",
        avatarUrl: "",
        passwordHash,
        role: AppRole.admin,
        planName: "admin",
        subscription: "active",
      },
    });

    console.log("✅ Admin user created or updated:", adminUser.email);

    await prisma.serviceCenterConfig.upsert({
      where: { centerId: adminUser.id },
      update: {
        featureToggles: {},
        extensionPacks: {},
        dashboardThemeConfig: {},
        branches: {},
        machineConfig: {},
        reportConfig: {},
        workshopSettings: {},
        shiftSettings: {},
        auditConfig: {},
        subscriptionStatus: {},
        mechanicShiftProfiles: {},
        recentCustomerProfiles: {},
        dashboardLayout: {},
        serviceBays: {},
        jobQueue: {},
      },
      create: {
        centerId: adminUser.id,
        featureToggles: {},
        extensionPacks: {},
        dashboardThemeConfig: {},
        branches: {},
        machineConfig: {},
        reportConfig: {},
        workshopSettings: {},
        shiftSettings: {},
        auditConfig: {},
        subscriptionStatus: {},
        mechanicShiftProfiles: {},
        recentCustomerProfiles: {},
        dashboardLayout: {},
        serviceBays: {},
        jobQueue: {},
      },
    });

    console.log("✅ Default service center config created for:", adminUser.email);
  }
}

main()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
