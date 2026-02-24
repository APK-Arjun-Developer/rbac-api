import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.users.findFirst({
    where: { email: "admin@system.com" },
  });

  if (existing) {
    console.log("System admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await prisma.users.create({
    data: {
      username: "systemadmin",
      email: "admin@system.com",
      mobile: "9999999999",
      password: hashedPassword,
      first_name: "System",
      last_name: "Admin",
      is_email_verified: true,
      is_mobile_verified: true,
      is_active: true,
      created_by: "system",
    },
  });

  console.log("System admin seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

