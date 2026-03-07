import { PrismaClient, Prisma } from "@prisma/client";
import { LoggerService } from "../service/logger.service";

type ModelSelectMap = {
  User: Prisma.UserSelect;
  Company: Prisma.CompanySelect;
  Address: Prisma.AddressSelect;
  Asset: Prisma.AssetSelect;
  Role: Prisma.RoleSelect;
  Permission: Prisma.PermissionSelect;
};

type ModelName = keyof ModelSelectMap;

export abstract class BaseRepository {
  protected readonly prisma: PrismaClient;
  protected readonly logger: LoggerService;

  constructor(prisma: PrismaClient, context: string) {
    this.prisma = prisma;
    this.logger = new LoggerService(context);
  }

  /**
   * Execute logic inside a database transaction.
   * @param fn - The function containing the transactional logic, which receives a Prisma TransactionClient.
   * @returns The result of the transactional function.
   * @throws Any error that occurs during the transaction will be logged and re-thrown.
   */
  public async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    try {
      return await this.prisma.$transaction(fn);
    } catch (error) {
      this.logger.error("Database transaction failed", error);
      throw error;
    }
  }

  /**
   * Get the select arguments for a given model to specify which fields to retrieve.
   * @param modelName - The name of the model for which to get the select arguments.
   * @returns An object containing the select arguments for the specified model.
   */
  public getSelectArgs(modelName: ModelName): ModelSelectMap[ModelName] {
    const User = this.buildSelect<Prisma.UserSelect>([
      "id",
      "addressId",
      "profileAssetId",
      "username",
      "password",
      "firstName",
      "lastName",
      "email",
      "mobile",
      "isEmailVerified",
      "isMobileVerified",
      "isActive",
    ]);

    const Company = this.buildSelect<Prisma.CompanySelect>([
      "id",
      "addressId",
      "profileAssetId",
      "name",
      "isActive",
    ]);

    const Address = this.buildSelect<Prisma.AddressSelect>([
      "id",
      "addressLine1",
      "addressLine2",
      "city",
      "district",
      "state",
      "pincode",
    ]);

    const Asset = this.buildSelect<Prisma.AssetSelect>([
      "id",
      "originalName",
      "uploadedName",
      "fileFormat",
      "storageType",
      "relativePath",
    ]);

    const Role = this.buildSelect<Prisma.RoleSelect>(["id", "companyId", "name", "description"]);

    const Permission = this.buildSelect<Prisma.PermissionSelect>([
      "id",
      "name",
      "resource",
      "action",
    ]);

    const models: ModelSelectMap = {
      User,
      Company,
      Address,
      Asset,
      Role,
      Permission,
    };

    return models[modelName];
  }

  private buildSelect<T extends Record<string, any>>(fields: (keyof T)[]): T {
    const select = {} as T;

    for (const field of fields) {
      select[field] = true as T[keyof T];
    }

    return select;
  }
}
