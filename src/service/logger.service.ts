import { logger } from "../logger/logger";

type LogMeta = Record<string, any>;

export class LoggerService {
  constructor(private readonly context?: string) {}

  info(message: string, meta?: LogMeta): void {
    logger.info(message, {
      context: this.context,
      ...meta,
    });
  }

  warn(message: string, meta?: LogMeta): void {
    logger.warn(message, {
      context: this.context,
      ...meta,
    });
  }

  debug(message: string, meta?: LogMeta): void {
    logger.debug(message, {
      context: this.context,
      ...meta,
    });
  }

  error(message: string, error?: unknown, meta?: LogMeta): void {
    if (error instanceof Error) {
      logger.error(message, {
        context: this.context,
        stack: error.stack,
        error: error.message,
        ...meta,
      });
      return;
    }

    logger.error(message, {
      context: this.context,
      error,
      ...meta,
    });
  }
}
