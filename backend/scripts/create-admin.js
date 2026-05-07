require("dotenv").config();
const prisma = require("../src/config/prisma");
const { hashPassword } = require("../src/utils/hash.util");
const { randomUUID } = require("crypto");

const main = async () => {
  const email = process.env.ADMIN_EMAIL || "admin@school.local";
  const phone_number = process.env.ADMIN_PHONE || "+250780000000";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const name = process.env.ADMIN_NAME || "Administrator";

  // 1. Check if admin already exists
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { phone_number }
      ]
    }
  });

  if (existing) {
    console.log("Admin user already exists:", existing.id);
    return;
  }

  // 2. Create admin user
  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      name,
      email,
      phone_number,
      password: await hashPassword(password),
      role: "ADMIN",
      status: "ACTIVE",
      isVerified: true
    }
  });

  // 3. Create device (safe fallback in case relation is strict)
  try {
    await prisma.device.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        isVerified: true,
        verifiedAt: new Date(),
        verifiedById: user.id
      }
    });
  } catch (deviceError) {
    console.warn("Device creation failed (non-blocking):", deviceError.message);
  }

  console.log(" Admin account created successfully:", {
    id: user.id,
    email,
    phone_number
  });
};

main()
  .catch((err) => {
    console.error(" Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
