import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("⚠️  Dropping the current MongoDB database. This is destructive!");
    await prisma.$connect();

    const result = await prisma.$runCommandRaw({ dropDatabase: 1 });
    console.log("✅ Database dropped successfully:", result);
  } catch (error) {
    console.error("❌ Failed to drop the database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
