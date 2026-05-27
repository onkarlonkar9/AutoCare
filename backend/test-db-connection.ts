import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Testing MongoDB connection...");
    
    // Test connection by trying to count users
    const userCount = await prisma.user.count();
    
    console.log("✅ MongoDB connection successful!");
    console.log(`📊 Total users in database: ${userCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
