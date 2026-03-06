import { PrismaClient, Prisma } from "@prisma/client";
import { LoggerService } from "../service/logger.service";

export abstract class BaseRepository {
  protected readonly prisma: PrismaClient;
  protected readonly logger: LoggerService;

  constructor(prisma: PrismaClient, context: string) {
    this.prisma = prisma;
    this.logger = new LoggerService(context);
  }

  /**
   * Execute logic inside a database transaction.
   */
  public async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    try {
      return await this.prisma.$transaction(fn);
    } catch (error) {
      this.logger.error("Database transaction failed", error);
      throw error;
    }
  }

  public getSelectArgs() {
    const userFields = this.buildSelect<Prisma.UserSelect>([
      "id",
      "addressId",
      "profileAssetId",
      "isActive",
      "username",
      "password",
      "firstName",
      "lastName",
      "email",
      "mobile",
      "isEmailVerified",
      "isMobileVerified",
    ]);

    return { userFields };
  }

  private buildSelect<T extends Record<string, any>>(fields: (keyof T)[]): T {
    const select = {} as T;

    for (const field of fields) {
      select[field] = true as T[keyof T];
    }

    return select;
  }
}
