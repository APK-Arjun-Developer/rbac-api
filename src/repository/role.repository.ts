import { Prisma, Role } from "@prisma/client";
import { BaseRepository } from "@repository";

/**
 * RoleRepository handles all database operations related to roles.
 * @class RoleRepository
 */
export class RoleRepository extends BaseRepository {
  constructor() {
    super("RoleRepository");
  }
  /**
   * Retrieves a single role by ID with all associated relationships.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the role
   * @returns {Promise<Role|null>} Role object with all related data, or null if not found or soft-deleted
   * @throws Will throw if database query fails
   */
  async getById(db: Prisma.TransactionClient, id: string) {
    return db.role.findFirst({
      where: { id, deletedAt: null },
      include: {
        company: true,
        userRoles: {
          where: { deletedAt: null },
          include: {
            user: {
              include: {
                profileAsset: true,
                address: true,
              },
            },
          },
        },
        rolePermissions: {
          where: { deletedAt: null },
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Retrieves all roles.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} companyId - The company ID to filter roles by
   * @returns {Promise<Role[]>} Array of role objects
   * @throws Will throw if database query fails
   */
  async getAll(db: Prisma.TransactionClient, companyId: string): Promise<Role[]> {
    return db.role.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        company: true,
        rolePermissions: {
          where: { deletedAt: null },
          include: {
            permission: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Retrieves all roles with role names.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} companyId - The company ID to filter roles by
   * @param {string} names - The role names to filter by
   * @returns {Promise<Role[]>} Array of role objects
   * @throws Will throw if database query fails
   */
  async getByNames(
    db: Prisma.TransactionClient,
    companyId: string,
    names: string[],
  ): Promise<Role[]> {
    return db.role.findMany({
      where: {
        name: { in: names },
        companyId,
        deletedAt: null,
      },
    });
  }

  /**
   * Retrieves roles by company ID.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} companyId - The company ID to filter roles by
   * @returns {Promise<Role[]>} Array of role objects for the specified company
   * @throws Will throw if database query fails
   */
  async getByCompanyId(db: Prisma.TransactionClient, companyId: string): Promise<Role[]> {
    return db.role.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        rolePermissions: {
          where: { deletedAt: null },
          include: {
            permission: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Retrieves a role by name within a specific company.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} name - The role name to search for
   * @param {string} companyId - The company ID to scope the search
   * @returns {Promise<Role|null>} Role object if found, null otherwise
   * @throws Will throw if database query fails
   */
  async getByNameAndCompanyId(
    db: Prisma.TransactionClient,
    name: string,
    companyId: string,
  ): Promise<Role | null> {
    return db.role.findFirst({
      where: {
        name,
        companyId,
        deletedAt: null,
      },
    });
  }

  /**
   * Creates a new role in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {Prisma.RoleCreateInput} data - Complete role creation data including company association
   * @returns {Promise<Role>} The newly created role object
   * @throws Will throw if database operation fails (e.g., unique constraint violation)
   * @throws Will throw if required fields are missing
   */
  async create(db: Prisma.TransactionClient, data: Prisma.RoleCreateInput): Promise<Role> {
    return db.role.create({ data });
  }

  /**
   * Creates a new roles in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {Prisma.RoleCreateManyInput[]} data - Complete role creation data
   * @returns {Promise<Role[]>} The newly created role objects
   * @throws Will throw if database operation fails (e.g., unique constraint violation)
   * @throws Will throw if required fields are missing
   */
  async createMany(
    db: Prisma.TransactionClient,
    data: Prisma.RoleCreateManyInput[],
  ): Promise<Role[]> {
    return db.role.createManyAndReturn({ data });
  }

  /**
   * Updates role information in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the role to update
   * @param {Prisma.RoleUpdateInput} data - Object containing fields to update
   * @returns {Promise<Role>} The updated role object
   * @throws Will throw if role not found
   * @throws Will throw if database operation fails (e.g., unique constraint violation)
   */
  async update(
    db: Prisma.TransactionClient,
    id: string,
    data: Prisma.RoleUpdateInput,
  ): Promise<Role> {
    return db.role.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Performs a soft delete on a role.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the role to soft-delete
   * @param {string} deletedBy - The ID or identifier of the user/system that initiated the deletion
   * @returns {Promise<Role>} The soft-deleted role object with updated deletedAt and deletedBy fields
   * @throws Will throw if role not found
   * @throws Will throw if database operation fails
   */
  async softDelete(db: Prisma.TransactionClient, id: string, deletedBy: string): Promise<Role> {
    return db.role.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  /**
   * Permanently deletes a role from the database (hard delete).
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the role to permanently delete
   * @returns {Promise<Role>} The deleted role object
   * @throws Will throw if role not found
   * @throws Will throw if database operation fails
   */
  async delete(db: Prisma.TransactionClient, id: string): Promise<Role> {
    return db.role.delete({
      where: { id },
    });
  }
}
