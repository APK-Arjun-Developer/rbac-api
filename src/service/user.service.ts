import { Prisma, SystemRoleType } from "@prisma/client";
import { db } from "../config/database";
import { userRepository } from "../repository/user.repository";

/**
 * UserService handles all business logic, validation, and rules for user management.
 */
export class UserService {
  /**
   * Retrieves all active users grouped by company.
   * @returns {Promise<Array>} Array of objects containing company info and associated users
   * @returns {Object} return[].company - Company information (id, name, isActive)
   * @returns {Array} return[].users - Array of User objects for that company
   */
  async getAllUsers() {
    const companies = await userRepository.getAllUsersGroupedByCompany();

    // transform into schema-defined shape: { company: {id,name,isActive}, users: User[] }
    return companies.map((company) => {
      const users = company.userCompanies
        .filter((uc) => uc.user.systemRole.type === SystemRoleType.COMPANY_USER)
        .map((uc) => uc.user);

      return {
        company: {
          id: company.id,
          name: company.name,
          isActive: company.isActive,
        },
        users,
      };
    });
  }

  /**
   * Retrieves all active users belonging to a specific company.
   * @param {string} companyId - The unique identifier of the company
   * @returns {Promise<Object>} Object containing company information and user array
   * @returns {Object} return.company - Company details (id, name, isActive) or null if not found
   * @returns {Array<User>} return.users - Array of users associated with the company
   */
  async getCompanyUsers(companyId: string) {
    // repository now returns { company, users }
    return userRepository.getCompanyUsers(companyId);
  }

  /**
   * Retrieves a single user by their unique identifier.
   * @param {string} id - The unique identifier of the user to retrieve
   * @returns {Promise<User>} The user object with all associated data
   */
  async getById(id: string) {
    const user = await userRepository.getById(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  /**
   * Creates a new company user with validation of unique fields.
   * @param {Prisma.UserCreateInput} data - User creation data (email, username, password, mobile, etc.)
   * @param {string} companyId - ID of the company the user should be linked to
   * @returns {Promise<User>} The newly created user object
   */
  async createCompanyUser(data: Prisma.UserCreateInput, companyId: string) {
    await this.ensureUniqueFields(data);

    // delegate actual creation to the repository, which keeps database logic
    return userRepository.create({
      ...data,
      systemRole: {
        connect: { type: SystemRoleType.COMPANY_USER },
      },
      userCompanies: {
        create: { companyId },
      },
    });
  }

  /**
   * Updates user information (profile, contact details, etc.).
   * Password updates are NOT allowed through this method for security purposes.
   * Validates uniqueness of email, username, and mobile if being updated.
   *
   * @param {string} id - The unique identifier of the user to update
   * @param {Prisma.UserUpdateInput} data - The fields to update (must not include password)
   * @returns {Promise<User>} The updated user object
   *
   * @example
   * const updated = await userService.updateUser('user-123', { email: 'newemail@example.com' });
   *
   * @throws {Error} Throws 'Password update not allowed in this method' if password is included
   * @throws {Error} Throws if user not found
   * @throws {Error} Throws if email, username, or mobile already exists for another user
   */
  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    if ("password" in data) {
      throw new Error("Password update not allowed in this method");
    }

    await this.getById(id);
    await this.ensureUniqueFields(data, id);

    return userRepository.update(id, data);
  }

  /**
   * Performs a soft delete on a user.
   * @param {string} id - The unique identifier of the user to delete
   * @param {string} deletedBy - User ID or identifier of who initiated the deletion (for audit purposes)
   * @returns {Promise<User>} The soft-deleted user object
   */
  async deleteUser(id: string, deletedBy: string) {
    await this.getById(id);
    return userRepository.softDelete(id, deletedBy);
  }

  /**
   * Private method that validates uniqueness of critical user fields.
   * @private
   * @param {Object} data - Object containing optional fields to validate (email, username, mobile)
   * @param {string} [excludeUserId] - Optional user ID to exclude from uniqueness check (for updates)
   * @returns {Promise<void>} Resolves if all checks pass
   * @throws {Error} Throws 'Username already exists' if username is taken
   * @throws {Error} Throws 'Email already exists' if email is taken
   * @throws {Error} Throws 'Mobile already exists' if mobile number is taken
   */
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
