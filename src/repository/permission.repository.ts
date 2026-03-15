import { Prisma, Permission } from "@prisma/client";
import { BaseRepository } from "@repository";

/**
 * PermissionRepository handles all database operations related to permissions.
 * @class PermissionRepository
 */
export class PermissionRepository extends BaseRepository {
  constructor() {
    super("PermissionRepository");
  }
  /**
   * Retrieves a single permission by ID with all associated relationships.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the permission
   * @returns {Promise<Permission|null>} Permission object with all related data, or null if not found or soft-deleted
   * @throws Will throw if database query fails
   */
  async getById(db: Prisma.TransactionClient, id: string) {
    return db.permission.findFirst({
      where: { id, deletedAt: null },
      include: {
        rolePermissions: {
          where: { deletedAt: null },
          include: {
            role: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Retrieves all permissions with optional filtering.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @returns {Promise<Permission[]>} Array of permission objects
   * @throws Will throw if database query fails
   */
  async getAll(db: Prisma.TransactionClient): Promise<Permission[]> {
    return db.permission.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        rolePermissions: {
          where: { deletedAt: null },
          include: {
            role: {
              include: {
                company: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Creates a new permission in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {Prisma.PermissionCreateInput} data - Complete permission creation data including name, resource, action
   * @returns {Promise<Permission>} The newly created permission object
   * @throws Will throw if database operation fails (e.g., unique constraint violation)
   * @throws Will throw if required fields are missing
   */
  async create(
    db: Prisma.TransactionClient,
    data: Prisma.PermissionCreateInput,
  ): Promise<Permission> {
    return db.permission.create({ data });
  }

  /**
   * Updates permission information in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the permission to update
   * @param {Prisma.PermissionUpdateInput} data - Object containing fields to update
   * @returns {Promise<Permission>} The updated permission object
   * @throws Will throw if permission not found
   * @throws Will throw if database operation fails (e.g., unique constraint violation)
   */
  async update(
    db: Prisma.TransactionClient,
    id: string,
    data: Prisma.PermissionUpdateInput,
  ): Promise<Permission> {
    return db.permission.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Performs a soft delete on a permission.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the permission to soft-delete
   * @param {string} deletedBy - The ID or identifier of the user/system that initiated the deletion
   * @returns {Promise<Permission>} The soft-deleted permission object with updated deletedAt and deletedBy fields
   * @throws Will throw if permission not found
   * @throws Will throw if database operation fails
   */
  async softDelete(
    db: Prisma.TransactionClient,
    id: string,
    deletedBy: string,
  ): Promise<Permission> {
    return db.permission.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  /**
   * Permanently deletes a permission from the database (hard delete).
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the permission to permanently delete
   * @returns {Promise<Permission>} The deleted permission object
   * @throws Will throw if permission not found
   * @throws Will throw if database operation fails
   */
  async delete(db: Prisma.TransactionClient, id: string): Promise<Permission> {
    return db.permission.delete({
      where: { id },
    });
  }
}
