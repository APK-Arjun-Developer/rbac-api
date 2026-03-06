import { Prisma, Asset, PrismaClient } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import { db } from "../config/database";

/**
 * ProfileAssetRepository handles all database operations related to profile assets.
 * @class ProfileAssetRepository
 */
export class ProfileAssetRepository extends BaseRepository {
  constructor(prisma: PrismaClient = db) {
    super(prisma, "ProfileAssetRepository");
  }
  /**
   * Retrieves a single profile asset by ID.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the profile asset
   * @returns {Promise<Asset|null>} Profile asset object if found, null otherwise
   * @throws Will throw if database query fails
   */
  async getById(db: Prisma.TransactionClient, id: string): Promise<Asset | null> {
    return db.asset.findFirst({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Retrieves all profile assets with optional filtering.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @returns {Promise<Asset[]>} Array of profile asset objects
   * @throws Will throw if database query fails
   */
  async getAll(db: Prisma.TransactionClient): Promise<Asset[]> {
    return db.asset.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Creates a new profile asset in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {Prisma.AssetCreateInput} data - Complete profile asset creation data including originalName, uploadedName, fileFormat, etc.
   * @returns {Promise<Asset>} The newly created profile asset object
   * @throws Will throw if database operation fails (e.g., missing required fields)
   */
  async create(db: Prisma.TransactionClient, data: Prisma.AssetCreateInput): Promise<Asset> {
    return db.asset.create({ data });
  }

  /**
   * Updates profile asset information in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the profile asset to update
   * @param {Prisma.AssetUpdateInput} data - Object containing fields to update
   * @returns {Promise<Asset>} The updated profile asset object
   * @throws Will throw if profile asset not found
   * @throws Will throw if database operation fails
   */
  async update(
    db: Prisma.TransactionClient,
    id: string,
    data: Prisma.AssetUpdateInput,
  ): Promise<Asset> {
    return db.asset.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Performs a soft delete on a profile asset.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the profile asset to soft-delete
   * @param {string} deletedBy - The ID or identifier of the user/system that initiated the deletion
   * @returns {Promise<Asset>} The soft-deleted profile asset object with updated deletedAt and deletedBy fields
   * @throws Will throw if profile asset not found
   * @throws Will throw if database operation fails
   */
  async softDelete(db: Prisma.TransactionClient, id: string, deletedBy: string): Promise<Asset> {
    return db.asset.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  /**
   * Permanently deletes a profile asset from the database (hard delete).
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the profile asset to permanently delete
   * @returns {Promise<Asset>} The deleted profile asset object
   * @throws Will throw if profile asset not found
   * @throws Will throw if database operation fails
   */
  async delete(db: Prisma.TransactionClient, id: string): Promise<Asset> {
    return db.asset.delete({
      where: { id },
    });
  }
}

export const profileAssetRepository = new ProfileAssetRepository(db);
