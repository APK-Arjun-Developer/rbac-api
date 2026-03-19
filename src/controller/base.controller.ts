import { FastifyReply } from "fastify";

export class BaseController {
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
