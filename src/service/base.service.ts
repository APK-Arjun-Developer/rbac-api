import { PrismaClient, Prisma } from "@prisma/client";
import { LoggerService } from "@service";

export abstract class BaseService {
  protected readonly db: PrismaClient;
  protected readonly logger: LoggerService;

  constructor(prisma: PrismaClient, context: string) {
    this.db = prisma;
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
      return await this.db.$transaction(fn);
    } catch (error) {
      this.logger.error("Database transaction failed", error);
      throw error;
    }
  }
}
