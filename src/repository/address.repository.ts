import { Prisma, Address } from "@prisma/client";
import { BaseRepository } from "@repository";

/**
 * AddressRepository handles all database operations related to addresses.
 * @class AddressRepository
 */
export class AddressRepository extends BaseRepository {
  constructor() {
    super("AddressRepository");
  }
  /**
   * Retrieves a single address by ID.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the address
   * @returns {Promise<Address|null>} Address object if found, null otherwise
   * @throws Will throw if database query fails
   */
  async getById(db: Prisma.TransactionClient, id: string): Promise<Address | null> {
    return db.address.findFirst({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Retrieves all addresses with optional filtering.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @returns {Promise<Address[]>} Array of address objects
   * @throws Will throw if database query fails
   */
  async getAll(db: Prisma.TransactionClient): Promise<Address[]> {
    return db.address.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Creates a new address in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {Prisma.AddressCreateInput} data - Complete address creation data
   * @returns {Promise<Address>} The newly created address object
   * @throws Will throw if database operation fails (e.g., missing required fields)
   */
  async create(db: Prisma.TransactionClient, data: Prisma.AddressCreateInput): Promise<Address> {
    return db.address.create({ data });
  }

  /**
   * Updates address information in the database.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the address to update
   * @param {Prisma.AddressUpdateInput} data - Object containing fields to update
   * @returns {Promise<Address>} The updated address object
   * @throws Will throw if address not found
   * @throws Will throw if database operation fails
   */
  async update(
    db: Prisma.TransactionClient,
    id: string,
    data: Prisma.AddressUpdateInput,
  ): Promise<Address> {
    return db.address.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Performs a soft delete on an address.
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the address to soft-delete
   * @param {string} deletedBy - The ID or identifier of the user/system that initiated the deletion
   * @returns {Promise<Address>} The soft-deleted address object with updated deletedAt and deletedBy fields
   * @throws Will throw if address not found
   * @throws Will throw if database operation fails
   */
  async softDelete(db: Prisma.TransactionClient, id: string, deletedBy: string): Promise<Address> {
    return db.address.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  /**
   * Permanently deletes an address from the database (hard delete).
   * @async
   * @param {Prisma.TransactionClient} db - The database transaction client to use for the operation
   * @param {string} id - The unique identifier of the address to permanently delete
   * @returns {Promise<Address>} The deleted address object
   * @throws Will throw if address not found
   * @throws Will throw if database operation fails
   */
  async delete(db: Prisma.TransactionClient, id: string): Promise<Address> {
    return db.address.delete({
      where: { id },
    });
  }
}
