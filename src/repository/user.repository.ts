import { Prisma, SystemRoleType, User } from "@prisma/client";
import { BaseRepository } from "@repository";
import { ICompanySummary, ICompanyUsers } from "@type";

/**
 * UserRepository handles all database operations related to users.
 * @class UserRepository
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super("UserRepository");
  }
  /**
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @returns {Promise<Array>} Array of company objects with nested user data
   * @throws Will throw if database query fails
   */
  async getAllUsersGroupedByCompany(
    db: Prisma.TransactionClient,
    pagination: { skip: number; limit: number },
  ): Promise<{ items: ICompanyUsers[]; total: number }> {
    const [total, companies] = await Promise.all([
      db.company.count({ where: { deletedAt: null } }),
      db.company.findMany({
        where: { deletedAt: null },
        include: {
          profileAsset: true,
          address: true,
          userCompanies: {
            where: {
              deletedAt: null,
              user: {
                deletedAt: null,
                systemRole: { not: SystemRoleType.SYSTEM_ADMIN },
              },
            },
            include: {
              user: {
                include: {
                  profileAsset: true,
                  address: true,
                },
              },
            },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    const items = companies.map((company) => {
      const users = company.userCompanies
        .filter((uc) => uc.user.systemRole === SystemRoleType.COMPANY_USER)
        .map((uc) => uc.user);

      const companySummary: ICompanySummary = {
        id: company.id,
        name: company.name,
        isActive: company.isActive,
      };

      return {
        company: companySummary,
        users,
      };
    });

    return { items, total };
  }

  /**
   * Fetches all users belonging to a specific company along with company metadata.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} companyId - The unique identifier of the company
   * @returns {Promise<Object>} Object containing company info and users array
   * @throws Will throw if database query fails
   */
  async getCompanyUsers(
    db: Prisma.TransactionClient,
    companyId: string,
    pagination: { skip: number; limit: number },
  ): Promise<{ company: ICompanySummary | null; users: User[]; total: number }> {
    const [company, total, users] = await Promise.all([
      db.company.findFirst({
        where: { id: companyId, deletedAt: null },
        select: { id: true, name: true, isActive: true },
      }),
      db.user.count({
        where: {
          deletedAt: null,
          userCompanies: {
            some: {
              companyId,
              deletedAt: null,
            },
          },
        },
      }),
      db.user.findMany({
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
          userRoles: {
            where: { companyId, deletedAt: null },
            include: { role: true },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    return { company, users, total };
  }

  /**
   * Retrieves a single user by ID with all associated relationships.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the user
   * @returns {Promise<User|null>} User object with all related data, or null if not found or soft-deleted
   * @throws Will throw if database query fails
   */
  async getById(db: Prisma.TransactionClient, id: string) {
    return db.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        address: true,
        profileAsset: true,
        userCompanies: true,
        userRoles: true,
      },
    });
  }

  /**
   * Retrieves a user by their username.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} username - The username to search for
   * @returns {Promise<User|null>} User object if found, null otherwise
   * @throws Will throw if database query fails
   */
  async getByUsername(db: Prisma.TransactionClient, username: string) {
    return db.user.findFirst({
      where: { username, deletedAt: null },
    });
  }

  /**
   * Retrieves a user by their email address.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} email - The email address to search for
   * @returns {Promise<User|null>} User object if found, null otherwise
   * @throws Will throw if database query fails
   */
  async getByEmail(db: Prisma.TransactionClient, email: string) {
    return db.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  /**
   * Retrieves a user by their mobile phone number.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} mobile - The mobile phone number to search for (format should match database)
   * @returns {Promise<User|null>} User object if found, null otherwise
   * @throws Will throw if database query fails
   */
  async getByMobile(db: Prisma.TransactionClient, mobile: string) {
    return db.user.findFirst({
      where: { mobile, deletedAt: null },
    });
  }

  /**
   * Creates a new user in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {Prisma.UserCreateInput} data - Complete user creation data including email, username, password, role, etc.
   * @returns {Promise<User>} The newly created user object
   * @throws Will throw if database operation fails (e.g., unique constraint violation)
   * @throws Will throw if required fields are missing
   */
  async create(db: Prisma.TransactionClient, data: Prisma.UserCreateInput): Promise<User> {
    return db.user.create({ data });
  }

  /**
   * Updates user information in the database.
   * @async
   * @param {string} id - The unique identifier of the user to update
   * @param {Prisma.UserUpdateInput} data - Object containing fields to update
   * @returns {Promise<User>} The updated user object
   * @throws Will throw if user not found
   * @throws Will throw if database operation fails (e.g., unique constraint violation)
   */
  async update(
    db: Prisma.TransactionClient,
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return db.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Performs a soft delete on a user.
   * @async
   * @param {string} id - The unique identifier of the user to soft-delete
   * @param {string} deletedBy - The ID or identifier of the user/system that initiated the deletion (audit trail)
   * @returns {Promise<User>} The soft-deleted user object with updated deletedAt and deletedBy fields
   * @throws Will throw if user not found
   * @throws Will throw if database operation fails
   */
  async softDelete(db: Prisma.TransactionClient, id: string, deletedBy: string): Promise<User> {
    return db.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }
}
