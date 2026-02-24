import { Prisma, SystemRoleType } from "@prisma/client";
import { db } from "../config/database";
import { userRepository } from "../repository/user.repository";

/**
 * Handles business logic, validation, and rules.
 */
export class UserService {
  /* ------------------------------------------ */
  /* GET ALL USERS GROUPED BY COMPANY           */
  /* ------------------------------------------ */
  async getAllUsers() {
    const companies = await userRepository.getAllUsersGroupedByCompany();

    return companies.map((company) => {
      const owner =
        company.userCompanies.find((uc) => uc.user.systemRole.type === SystemRoleType.COMPANY_ADMIN)
          ?.user ?? null;

      const users = company.userCompanies
        .filter((uc) => uc.user.systemRole.type === SystemRoleType.COMPANY_USER)
        .map((uc) => uc.user);

      return {
        id: company.id,
        name: company.name,
        profileAsset: company.profileAsset,
        address: company.address,
        profile: owner,
        users,
      };
    });
  }

  /* ------------------------------------------ */
  /* GET COMPANY USERS                          */
  /* ------------------------------------------ */
  async getCompanyUsers(companyId: string) {
    return userRepository.getCompanyUsers(companyId);
  }

  /* ------------------------------------------ */
  /* GET USER BY ID                             */
  /* ------------------------------------------ */
  async getById(id: string) {
    const user = await userRepository.getById(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  /* ------------------------------------------ */
  /* CREATE COMPANY USER                        */
  /* ------------------------------------------ */
  async createCompanyUser(data: Prisma.UserCreateInput, companyId: string) {
    await this.ensureUniqueFields(data);

    return db.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          ...data,
          systemRole: {
            connect: {
              type: SystemRoleType.COMPANY_USER,
            },
          },
          userCompanies: {
            create: {
              companyId,
            },
          },
        },
      });
    });
  }

  /* ------------------------------------------ */
  /* UPDATE USER (EXCEPT PASSWORD)              */
  /* ------------------------------------------ */
  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    if ("password" in data) {
      throw new Error("Password update not allowed in this method");
    }

    await this.getById(id);
    await this.ensureUniqueFields(data, id);

    return userRepository.update(id, data);
  }

  /* ------------------------------------------ */
  /* DELETE USER (SOFT DELETE)                  */
  /* ------------------------------------------ */
  async deleteUser(id: string, deletedBy: string) {
    await this.getById(id);
    return userRepository.softDelete(id, deletedBy);
  }

  /* ------------------------------------------ */
  /* UNIQUE FIELD VALIDATION                    */
  /* ------------------------------------------ */
  private async ensureUniqueFields(data: any, excludeUserId?: string) {
    const checks = [];

    if (data.username) {
      checks.push(
        db.user.findFirst({
          where: {
            username: data.username,
            id: { not: excludeUserId },
            deletedAt: null,
          },
        }),
      );
    }

    if (data.email) {
      checks.push(
        db.user.findFirst({
          where: {
            email: data.email,
            id: { not: excludeUserId },
            deletedAt: null,
          },
        }),
      );
    }

    if (data.mobile) {
      checks.push(
        db.user.findFirst({
          where: {
            mobile: data.mobile,
            id: { not: excludeUserId },
            deletedAt: null,
          },
        }),
      );
    }

    const [username, email, mobile] = await Promise.all(checks);

    if (username) throw new Error("Username already exists");
    if (email) throw new Error("Email already exists");
    if (mobile) throw new Error("Mobile already exists");
  }
}

export const userService = new UserService();
