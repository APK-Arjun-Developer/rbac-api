import { PrismaClient, SystemRoleType } from "@prisma/client";
import bcrypt from "bcrypt";

export default async function seedSystemAdmin(tx: PrismaClient) {
  const username = "systemadmin";
  const password = "Admin@123";
  const email = "null";
  const mobile = null;

  /**
   * Ensure required system roles exist.
   * Uses upsert to make the seed idempotent.
   */
  const roleTypes: SystemRoleType[] = [
    SystemRoleType.SYSTEM_ADMIN,
    SystemRoleType.COMPANY_ADMIN,
    SystemRoleType.COMPANY_USER,
  ];

  for (const type of roleTypes) {
    await tx.systemRole.create({
      data: { type, description: `${type} role` },
    });
  }

  /**
   * Check if the system admin user already exists.
   * If found, exit early to prevent duplication.
   */
  const existingUser = await tx.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    console.log("[Seed 0001] System admin already exists");
    return;
  }

  /**
   * Create a default address record required by the User relation.
   */
  const address = await tx.address.create({
    data: {
      addressLine1: "System Headquarters",
      addressLine2: "Default Address",
      city: "System City",
      district: "System District",
      state: "System State",
      pincode: "000000",
      createdBy: "system",
    },
  });

  /**
   * Retrieve the SYSTEM_ADMIN role to associate with the user.
   */
  const systemAdminRole = await tx.systemRole.findUniqueOrThrow({
    where: { type: SystemRoleType.SYSTEM_ADMIN },
  });

  /**
   * Hash the password securely before storing.
   */
  const hashedPassword = await bcrypt.hash(password, 10);

  /**
   * Create the system administrator user with proper relations.
   */
  await tx.user.create({
    data: {
      username,
      email,
      mobile,
      password: hashedPassword,
      firstName: "System",
      lastName: "Admin",

      isEmailVerified: true,
      isMobileVerified: true,
      isActive: true,

      createdBy: "system",

      systemRoleId: systemAdminRole.id,
      addressId: address.id,
    },
  });

  console.log("[Seed 0001] System admin created successfully");
}
