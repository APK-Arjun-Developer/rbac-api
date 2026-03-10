import { Prisma, SystemRoleType } from "@prisma/client";
import { UserRepository } from "../repository/user.repository";
import { BaseService } from "./base.service";
import { db } from "../config/database";
import { CreateUserPayload, UpdateUserPayload, UniqueUserFields } from "../type/user.type";

/**
 * UserService handles all business logic, validation, and rules for user management.
 */
export class UserService extends BaseService {
  private readonly userRepository: UserRepository;

  constructor() {
    super(db, "UserService");
    this.userRepository = new UserRepository();
  }
  /**
   * Retrieves all active users grouped by company.
   * @returns {Promise<Array>} Array of objects containing company info and associated users
   * @returns {Object} return[].company - Company information (id, name, isActive)
   * @returns {Array} return[].users - Array of User objects for that company
   */
  async getAllUsers() {
    return this.transaction(async (tx) => {
      const companies = await this.userRepository.getAllUsersGroupedByCompany(tx);

      // transform into schema-defined shape: { company: {id,name,isActive}, users: User[] }
      return companies.map((company) => {
        const users = company.userCompanies
          .filter((uc) => uc.user.systemRole === SystemRoleType.COMPANY_USER)
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
    return this.transaction(async (tx) => {
      return this.userRepository.getCompanyUsers(tx, companyId);
    });
  }

  /**
   * Retrieves a single user by their unique identifier.
   * @param {string} id - The unique identifier of the user to retrieve
   * @returns {Promise<User>} The user object with all associated data
   */
  async getById(id: string) {
    return this.transaction(async (tx) => {
      const user = await this.userRepository.getById(tx, id);
      if (!user) throw new Error("User not found");
      return user;
    });
  }

  /**
   * Creates a new company user with validation of unique fields.
   * @param {CreateUserPayload} data - User creation data (email, username, password, mobile, etc.)
   * @param {string} companyId - ID of the company the user should be linked to
   * @returns {Promise<User>} The newly created user object
   */
  async createCompanyUser(data: CreateUserPayload, companyId: string) {
    const payload: Prisma.UserCreateInput = {
      username: data.username,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobile: data.mobile,
      userCompanies: { create: { companyId } },
      address: { connect: { id: data.addressId } },
      ...(data.profileAssetId && {
        profileAsset: { connect: { id: data.profileAssetId } },
      }),
    };
    return this.transaction(async (tx) => {
      await this.ensureUniqueFields(tx, {
        username: data.username,
        email: data.email,
        mobile: data.mobile,
      });

      // delegate actual creation to the repository, which keeps database logic
      return this.userRepository.create(tx, payload);
    });
  }

  /**
   * Creates a new company admin user with validation of unique fields.
   * @param {CreateUserPayload} data - User creation data (email, username, password, mobile, etc.)
   * @param {string} companyId - ID of the company the user should be linked to
   * @returns {Promise<User>} The newly created user object
   */
  async createCompanyAdminUser(data: CreateUserPayload, companyId: string) {
    const payload: Prisma.UserCreateInput = {
      username: data.username,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobile: data.mobile,
      systemRole: SystemRoleType.COMPANY_ADMIN,
      userCompanies: { create: { companyId } },
      address: { connect: { id: data.addressId } },
      ...(data.profileAssetId && {
        profileAsset: { connect: { id: data.profileAssetId } },
      }),
    };
    return this.transaction(async (tx) => {
      await this.ensureUniqueFields(tx, {
        username: data.username,
        email: data.email,
        mobile: data.mobile,
      });

      // delegate actual creation to the repository, which keeps database logic
      return this.userRepository.create(tx, payload);
    });
  }

  /**
   * Updates user information (profile, contact details, etc.).
   * Password updates are NOT allowed through this method for security purposes.
   * Validates uniqueness of email, username, and mobile if being updated.
   *
   * @param {string} id - The unique identifier of the user to update
   * @param {UpdateUserPayload} data - The fields to update (must not include password)
   * @returns {Promise<User>} The updated user object
   *
   * @example
   * const updated = await userService.updateUser('user-123', { email: 'newemail@example.com' });
   *
   * @throws {Error} Throws 'Password update not allowed in this method' if password is included
   * @throws {Error} Throws if user not found
   * @throws {Error} Throws if email, username, or mobile already exists for another user
   */
  async updateUser(id: string, data: UpdateUserPayload) {
    return this.transaction(async (tx) => {
      if ("password" in data) {
        throw new Error("Password update not allowed in this method");
      }

      const user = await this.userRepository.getById(tx, id);
      if (!user) throw new Error("User not found");
      const payload: Prisma.UserUpdateInput = {
        firstName: data.firstName,
        lastName: data.lastName,
        isActive: data.isActive,
        ...(data.profileAssetId && {
          profileAsset: { connect: { id: data.profileAssetId } },
        }),
        ...(data.addressId && {
          address: { connect: { id: data.addressId } },
        }),
      };

      return this.userRepository.update(tx, id, payload);
    });
  }

  /**
   * Performs a soft delete on a user.
   * @param {string} id - The unique identifier of the user to delete
   * @param {string} deletedBy - User ID or identifier of who initiated the deletion (for audit purposes)
   * @returns {Promise<User>} The soft-deleted user object
   */
  async deleteUser(id: string, deletedBy: string) {
    return this.transaction(async (tx) => {
      const user = await this.userRepository.getById(tx, id);
      if (!user) throw new Error("User not found");
      return this.userRepository.softDelete(tx, id, deletedBy);
    });
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
  private async ensureUniqueFields(
    db: Prisma.TransactionClient,
    data: UniqueUserFields,
    excludeUserId?: string,
  ) {
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
