import { Prisma, Asset } from "@prisma/client";
import { BaseRepository } from "./base.repository";

/**
 * AssetRepository handles all database operations related to assets.
 * @class AssetRepository
 */
export class AssetRepository extends BaseRepository {
  constructor() {
    super("AssetRepository");
  }
  /**
   * Retrieves a single asset by ID.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the asset
   * @returns {Promise<Asset|null>} Asset object if found, null otherwise
   * @throws Will throw if database query fails
   */
  async getById(db: Prisma.TransactionClient, id: string): Promise<Asset | null> {
    return db.asset.findFirst({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Retrieves all assets with optional filtering.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @returns {Promise<Asset[]>} Array of asset objects
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
   * Creates a new asset in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {Prisma.AssetCreateInput} data - Complete asset creation data including originalName, uploadedName, fileFormat, etc.
   * @returns {Promise<Asset>} The newly created asset object
   * @throws Will throw if database operation fails (e.g., missing required fields)
   */
  async create(db: Prisma.TransactionClient, data: Prisma.AssetCreateInput): Promise<Asset> {
    return db.asset.create({ data });
  }

  /**
   * Updates asset information in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the asset to update
   * @param {Prisma.AssetUpdateInput} data - Object containing fields to update
   * @returns {Promise<Asset>} The updated asset object
   * @throws Will throw if asset not found
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
   * Performs a soft delete on a asset.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the asset to soft-delete
   * @param {string} deletedBy - The ID or identifier of the user/system that initiated the deletion
   * @returns {Promise<Asset>} The soft-deleted asset object with updated deletedAt and deletedBy fields
   * @throws Will throw if asset not found
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
   * Permanently deletes a asset from the database (hard delete).
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the asset to permanently delete
   * @returns {Promise<Asset>} The deleted asset object
   * @throws Will throw if asset not found
   * @throws Will throw if database operation fails
   */
  async delete(db: Prisma.TransactionClient, id: string): Promise<Asset> {
    return db.asset.delete({
      where: { id },
    });
  }
}
