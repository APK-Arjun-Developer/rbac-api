import { AppError, LoggerService } from "@service";
import { FastifyReply, FastifyRequest } from "fastify";

type ControllerAction = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

export class BaseController {
  private readonly context: string;
  private readonly logger: LoggerService;

  constructor(context: string) {
    this.context = context;
    this.logger = new LoggerService(context);
  }

  protected controllerAction(action: ControllerAction) {
    return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        await action(request, reply);
      } catch (error) {
        this.logger.error(`Error in ${this.context}`, error);

        if (error instanceof AppError) {
          reply.status(error.statusCode).send({
            error: error.name,
            message: error.message,
          });
          return;
        }

        reply.status(500).send({
          error: "InternalServerError",
          message: "Internal server error",
        });
      }
    };
  }

  protected success(reply: FastifyReply, data: unknown, message = "Success") {
    reply.status(200).send({ message, data });
  }

  protected created(reply: FastifyReply, data: unknown, message = "Created successfully") {
    reply.status(201).send({ message, data });
  }

  protected noContent(reply: FastifyReply) {
    reply.status(204).send();
  }
}
