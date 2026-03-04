import { db } from "../config/database";
import { Prisma, SystemRoleType, User } from "@prisma/client";

/**
 * Handles ONLY database operations.
 * No business logic allowed here.
 */
export class UserRepository {
  /**
   * Get all companies with their users (excluding SYSTEM_ADMIN)
   */
  async getAllUsersGroupedByCompany() {
    return db.company.findMany({
      where: { deletedAt: null },
      include: {
        profileAsset: true,
        address: true,
        userCompanies: {
          where: {
            deletedAt: null,
            user: {
              deletedAt: null,
              systemRole: {
                type: { not: SystemRoleType.SYSTEM_ADMIN },
              },
            },
          },
          include: {
            user: {
              include: {
                systemRole: true,
                profileAsset: true,
                address: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get users of a specific company along with basic company info
   * @param companyId - ID of the company to fetch users for
   * @return object containing the company record and its users
   */
  async getCompanyUsers(
    companyId: string,
  ): Promise<{ company: { id: string; name: string; isActive: boolean } | null; users: User[] }> {
    const company = await db.company.findFirst({
      where: { id: companyId, deletedAt: null },
      select: { id: true, name: true, isActive: true },
    });

    const users = await db.user.findMany({
      where: {
        deletedAt: null,
        userCompanies: {
          some: {
            companyId,
            deletedAt: null,
          },
        },
      },
      include: {
        systemRole: true,
        userRoles: {
          where: { companyId, deletedAt: null },
          include: { role: true },
        },
      },
    });

    return { company, users };
  }

  /**
   * Get user by ID
   */
  async getById(id: string) {
    return db.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        systemRole: true,
        address: true,
        profileAsset: true,
        userCompanies: true,
        userRoles: true,
      },
    });
  }

  async getByUsername(username: string) {
    return db.user.findFirst({
      where: { username, deletedAt: null },
    });
  }

  async getByEmail(email: string) {
    return db.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async getByMobile(mobile: string) {
    return db.user.findFirst({
      where: { mobile, deletedAt: null },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return db.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return db.user.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<User> {
    return db.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }
}

export const userRepository = new UserRepository();
