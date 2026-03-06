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
}
