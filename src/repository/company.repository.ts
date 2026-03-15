import { Prisma, Company } from "@prisma/client";
import { BaseRepository } from "@repository";

/**
 * CompanyRepository handles all database operations related to companies.
 * @class CompanyRepository
 */
export class CompanyRepository extends BaseRepository {
  constructor() {
    super("CompanyRepository");
  }
  /**
   * Retrieves a single company by ID with all associated relationships.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the company
   * @returns {Promise<Company|null>} Company object with all related data, or null if not found or soft-deleted
   * @throws Will throw if database query fails
   */
  async getById(db: Prisma.TransactionClient, id: string) {
    return db.company.findFirst({
      where: { id, deletedAt: null },
      include: {
        address: true,
        profileAsset: true,
        userCompanies: {
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
        userRoles: {
          where: { deletedAt: null },
          include: {
            user: true,
            role: true,
          },
        },
        roles: {
          where: { deletedAt: null },
        },
      },
    });
  }

  /**
   * Retrieves all companies with optional filtering.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @returns {Promise<Company[]>} Array of company objects
   * @throws Will throw if database query fails
   */
  async getAll(db: Prisma.TransactionClient): Promise<Company[]> {
    return db.company.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        address: true,
        profileAsset: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Creates a new company in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {Prisma.CompanyCreateInput} data - Complete company creation data including address, profile asset, etc.
   * @returns {Promise<Company>} The newly created company object
   * @throws Will throw if database operation fails (e.g., unique constraint violation)
   * @throws Will throw if required fields are missing
   */
  async create(db: Prisma.TransactionClient, data: Prisma.CompanyCreateInput): Promise<Company> {
    return db.company.create({ data });
  }

  /**
   * Updates company information in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the company to update
   * @param {Prisma.CompanyUpdateInput} data - Object containing fields to update
   * @returns {Promise<Company>} The updated company object
   * @throws Will throw if company not found
   * @throws Will throw if database operation fails (e.g., unique constraint violation)
   */
  async update(
    db: Prisma.TransactionClient,
    id: string,
    data: Prisma.CompanyUpdateInput,
  ): Promise<Company> {
    return db.company.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Performs a soft delete on a company.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the company to soft-delete
   * @param {string} deletedBy - The ID or identifier of the user/system that initiated the deletion
   * @returns {Promise<Company>} The soft-deleted company object with updated deletedAt and deletedBy fields
   * @throws Will throw if company not found
   * @throws Will throw if database operation fails
   */
  async softDelete(db: Prisma.TransactionClient, id: string, deletedBy: string): Promise<Company> {
    return db.company.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  /**
   * Permanently deletes a company from the database (hard delete).
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the company to permanently delete
   * @returns {Promise<Company>} The deleted company object
   * @throws Will throw if company not found
   * @throws Will throw if database operation fails
   */
  async delete(db: Prisma.TransactionClient, id: string): Promise<Company> {
    return db.company.delete({
      where: { id },
    });
  }
}
